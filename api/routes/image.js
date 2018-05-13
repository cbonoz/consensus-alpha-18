const {AWS} = require('../common.js');
const dynamodb = new AWS.DynamoDB();
const s3 = new AWS.S3();
const logger = require('../logger');
const async = require("async");
const fs = require("fs");
const path = require('path');
const request = require('request');
const faker = require("faker");
const uuidv4 = require('uuid/v4');
const _ = require('lodash');
const HttpStatus = require('http-status-codes');
const dicomParser = require('dicom-parser');
const sjcl 						= require('sjcl');
const config 					= require('config');

const documentClient = new AWS.DynamoDB.DocumentClient();

const s3BucketName = 'london.data.behold.ai';

const TAG_DICT = JSON.parse(fs.readFileSync( path.resolve(__dirname, "./dicomDataDictionary.json"), 'utf8'));
const UIDS = JSON.parse(fs.readFileSync( path.resolve(__dirname, "./uids.json"), 'utf8'));
const port = config.get("model_server.api_config.port")
const endpoint = config.get("model_server.api_config.host") + ((":" + port) || "")
logger.info(`Model server endpoint: ${endpoint}`)

function _classify(file_path, callback) {
	var req = request.post({
		url: endpoint + "/image/classify/chestxray14",
		formData: {
	    file: fs.createReadStream(file_path)
	  }
	}, function(err, resp, body) {
		if (err) {
			logger.error("Error Classifying File");
			logger.error(err);
			callback(err);
		} else {
			logger.debug('Success classifying file : ' + file_path);
			callback(null, body);
		}
	});

}

function _upload_to_s3(_file, callback) {
	fs.readFile(_file.path, function(err, stream) {
		var today = new Date();
		var s3Key = path.join("East_Surrey_Hospital", "Uploads", String(today.getUTCFullYear()), String(today.getUTCMonth() + 1), String(today.getUTCDate()), String(today.getUTCHours()), _file.filename);
		var params = {
			Bucket: s3BucketName,
			Key: s3Key,
			Body: stream,
			ACL: "authenticated-read",
			ContentType: _file.mimetype
		};
		s3.upload(params, function(uploadErr, uploadResp) {
			// Whether there is an error or not, delete the temp file
			fs.unlink(_file.path, function(unlinkErr) {
				if (unlinkErr) {
					response_json = {
						message: "Failed to unlink file : " + _file.originalname,
						error: unlinkErr
					}
					callback(unlinkErr);
				} else {
					if (uploadErr) {
						response_json = {
							message: "Failed to upload file : " + _file.originalname,
							error: uploadErr
						}
						callback(uploadErr);
					} else {
						logger.debug("Success Uploading File: " + _file.originalname + " to S3")
						for (var k in _file)
							uploadResp[k] = _file[k];
						callback(null, uploadResp);
					}
				}
			});
		});
	});
}

function mapUid(str) {
	var uid = UIDS[str];
	if (uid) {
		return ' [ ' + uid + ' ]';
	}
	return '';
}

// helper function to see if a string only has ascii characters in it
function isASCII(str) {
	return /^[\x00-\x7F]*$/.test(str);
}

// This function iterates through dataSet recursively and adds new HTML strings
// to the output array passed into it
function dumpDataSet(dataSet, output, indent) {
	var rtn_obj = {}
	function getTag(tag) {
		var group = tag.substring(1, 5);
		var element = tag.substring(5, 9);
		var tagIndex = ("(" + group + "," + element + ")").toUpperCase();
		var attr = TAG_DICT[tagIndex];
		return attr;
	}
	try {
		var keys = [];
		for (var propertyName in dataSet.elements) {
			keys.push(propertyName);
		}
		keys.sort();
		// the dataSet.elements object contains properties for each element parsed.  The name of the property
		// is based on the elements tag and looks like 'xGGGGEEEE' where GGGG is the group number and EEEE is the
		// element number both with lowercase hexadecimal letters.  For example, the Series Description DICOM element 0008,103E would
		// be named 'x0008103e'.  Here we iterate over each property (element) so we can build a string describing its
		// contents to add to the output array
		for (var k = 0; k < keys.length; k++) {
			var propertyName = keys[k];
			var element = dataSet.elements[propertyName];

			var text = "";
			var str = ""
			var title = "";
			var tag = getTag(element.tag);

			// Here we check for Sequence items and iterate over them if present.  items will not be set in the
			// element object for elements that don't have SQ VR type.  Note that implicit little endian
			// sequences will are currently not parsed.
			if (element.items) {
				// each item contains its own data set so we iterate over the items
				// and recursively call this function
				element.items.forEach(function(item) {
					rtn_obj[tag.name] = dumpDataSet(item.dataSet, output, indent + "---");
				});
			} else if (element.fragments) {
				text += "encapsulated pixel data with " + element.basicOffsetTable.length + " offsets and " + element.fragments.length + " fragments";

				element.fragments.forEach(function(fragment) {
					fragment.position
					fragment.offset
					fragment.length
				})
				dataSet.byteArray

				if (element.encapsulatedPixelData) {
					var bot = element.basicOffsetTable;
					// if empty bot and not RLE, calculate it
					if (bot.length === 0) {
						bot = dicomParser.createJPEGBasicOffsetTable(dataSet, element);
					}
					function imageFrameLink(frameIndex) {
						var linkText = "<a class='imageFrameDownload' ";
						linkText += "data-frameIndex='" + frameIndex + "'";
						linkText += " href='#'> Frame #" + frameIndex + "</a>";
						return linkText;
					}
					for (var frameIndex = 0; frameIndex < bot.length; frameIndex++) {
						str += imageFrameLink(frameIndex, "Frame #" + frameIndex);
						str += ' dataOffset = ' + (
						element.fragments[0].position + bot[frameIndex]);
						str += '; offset = ' + (
						bot[frameIndex]);
						var imageFrame = dicomParser.readEncapsulatedImageFrame(dataSet, element, frameIndex, bot);
					}
				}
			} else {
				const maxLength = 128;
				// use VR to display the right value
				var vr;
				if (element.vr !== undefined) {
					vr = element.vr;
				} else {
					if (tag !== undefined) {
						vr = tag.vr;
					}
				}

				// if the length of the element is less than 128 we try to show it.  We put this check in
				// to avoid displaying large strings which makes it harder to use.
				if (element.length < maxLength) {

					// Since the dataset might be encoded using implicit transfer syntax and we aren't using
					// a data dictionary, we need some simple logic to figure out what data types these
					// elements might be.  Since the dataset might also be explicit we could be switch on the
					// VR and do a better job on this, perhaps we can do that in another example
					// First we check to see if the element's length is appropriate for a UI or US VR.
					// US is an important type because it is used for the
					// image Rows and Columns so that is why those are assumed over other VR types.
					if (element.vr === undefined && tag === undefined) {
						// console.log("XXXXX")
						if (element.length === 2) {
							text += " (" + dataSet.uint16(propertyName) + ")";
						} else if (element.length === 4) {
							text += " (" + dataSet.uint32(propertyName) + ")";
						}
						// Next we ask the dataset to give us the element's data in string form.  Most elements are
						// strings but some aren't so we do a quick check to make sure it actually has all ascii
						// characters so we know it is reasonable to display it.
						var str = dataSet.string(propertyName);
						var stringIsAscii = isASCII(str);
						if (stringIsAscii) {
							// the string will be undefined if the element is present but has no data
							// (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
							// data.  Note that the length of the element will be 0 to indicate "no data"
							// so we don't put anything here for the value in that case.
							if (str !== undefined) {
								text += '"' + str + '"' + mapUid(str);
							}
						} else {
							if (element.length !== 2 && element.length !== 4) {
								// If it is some other length and we have no string
								text += "<i>binary data</i>";
							}
						}
					} else {
						var is_str_vr = !_.includes([
							"AT",
							"FL",
							"FD",
							"OB",
							"OF",
							"OW",
							"SI",
							"SQ",
							"SS",
							"UL",
							"US"
						], vr)
						if (is_str_vr) {

							// Next we ask the dataset to give us the element's data in string form.  Most elements are
							// strings but some aren't so we do a quick check to make sure it actually has all ascii
							// characters so we know it is reasonable to display it.
							str = dataSet.string(propertyName);
							var stringIsAscii = isASCII(str);
							text = ""
							if (stringIsAscii) {
								// the string will be undefined if the element is present but has no data
								// (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
								// data.  Note that the length of the element will be 0 to indicate "no data"
								// so we don't put anything here for the value in that case.
								if (str !== undefined) {
									text += mapUid(str);
								}
							}
							// if (tag) {
							// 	console.log(indent, element.tag, tag.name, element.vr, element.length, str, text)
							// } else {
							// 	console.log(indent, element.tag, element.vr, element.length, str, text)
							// 	continue
							// }
						} else if (vr === 'US') {
							text += dataSet.uint16(propertyName);
							for (var i = 1; i < dataSet.elements[propertyName].length / 2; i++) {
								text += '\\' + dataSet.uint16(propertyName, i);
							}
							// console.log("##############", text)
						} else if (vr === 'SS') {
							text += dataSet.int16(propertyName);
							for (var i = 1; i < dataSet.elements[propertyName].length / 2; i++) {
								text += '\\' + dataSet.int16(propertyName, i);
							}
							// console.log("##############", text)
						} else if (vr === 'UL') {
							text += dataSet.uint32(propertyName);
							for (var i = 1; i < dataSet.elements[propertyName].length / 4; i++) {
								text += '\\' + dataSet.uint32(propertyName, i);
							}
							// console.log("##############", text)
						} else if (vr === 'SL') {
							text += dataSet.int32(propertyName);
							for (var i = 1; i < dataSet.elements[propertyName].length / 4; i++) {
								text += '\\' + dataSet.int32(propertyName, i);
							}
							// console.log("##############", text)
						} else if (vr == 'FD') {
							text += dataSet.double(propertyName);
							for (var i = 1; i < dataSet.elements[propertyName].length / 8; i++) {
								text += '\\' + dataSet.double(propertyName, i);
							}
						} else if (vr == 'FL') {
							text += dataSet.float(propertyName);
							for (var i = 1; i < dataSet.elements[propertyName].length / 4; i++) {
								text += '\\' + dataSet.float(propertyName, i);
							}
						} else if (vr === 'OB' || vr === 'OW' || vr === 'UN' || vr === 'OF' || vr === 'UT') {
							// If it is some other length and we have no string
							// if(element.length === 2) {
							//     text += "<i>" + " of length " + element.length + " as uint16: " +dataSet.uint16(propertyName);
							// } else if(element.length === 4) {
							//     text += "<i>" + dataDownloadLink(element, "binary data") + " of length " + element.length + " as uint32: " +dataSet.uint32(propertyName);
							// } else {
							//     text += "<i>" + dataDownloadLink(element, "binary data") + " of length " + element.length + " and VR " + vr + "</i>";
							// }
						} else if (vr === 'AT') {
							var group = dataSet.uint16(propertyName, 0);
							var groupHexStr = ("0000" + group.toString(16)).substr(-4);
							var element = dataSet.uint16(propertyName, 1);
							var elementHexStr = ("0000" + element.toString(16)).substr(-4);
							text += "x" + groupHexStr + elementHexStr;
						} else if (vr === 'SQ') {} else {
							// If it is some other length and we have no string
							text += "<i>no display code for VR " + vr + " yet, sorry!</i>";
						}

						if (tag && str && str !== "") {
							rtn_obj[tag.name] = str
							// console.log(indent, element.tag, tag.name, element.vr, element.length, str, text)
						} else {
							// console.log(indent, element.tag, element.vr, element.length, str, text)
							// continue
						}


					}
				}
			}
		}
		return rtn_obj
	} catch (err) {
		console.error(err)
		var ex = {
			exception: err,
			output: output
		}
		throw ex;
	}
}

function _decode_dicom(_file, cb) {
	fs.readFile(_file.path, function(err, stream) {
		if (err) {
			logger.error("Error decoding DICOM");
			logger.error(err);
			cb(err);
		} else {
			try {
				// Parse the byte array to get a DataSet object that has the parsed contents
				var dataSet = dicomParser.parseDicom(stream/* , options */);
				var output = [];
				dicom_dict = dumpDataSet(dataSet, output, "-");
				cb(null, dicom_dict);
			} catch (ex) {
				console.log('Error parsing byte stream' - ex);
			}
		}
	})
}

function _write_to_dynamo(_file, _db_callback) {
	async.parallel([
		// Upload to S3
		function(_classify_callback) {
			_classify(_file.path, _classify_callback)
		},
		// Classify
		function(_upload_callback) {
			_upload_to_s3(_file, _upload_callback)
		},
		// decode dicom
		function(_decode_dicom_callback) {
			_decode_dicom(_file, _decode_dicom_callback)
		}
	], function(err, resp) {
		if (err) {
			logger.error(err)
			_db_callback(err)
		} else {
			const class_res = JSON.parse(resp[0]);
			const s3_res = resp[1];
			const dicom_res = resp[2];
			var params = {
				TableName: config.get('AWS.DynamoDB.dbConfig.studies_table'),
				Item: {
					uuid: uuidv4(),
					creation_time: Date.now(),
					"orig_file_sha256_hexdigest": _file.sha256_hexdigest,
					dicom_tags : dicom_res
				}
			};

			_.forOwn(s3_res, function(value, key) {
				params.Item[key] = value
			})
			_.forOwn(class_res.results[0], function(value, key) {
				params.Item[key] = value
			})
			documentClient.put(params, function(err, data) {
				if (err) {
					logger.error(err)
					_db_callback(err)
				} else {
					_db_callback(null, params.Item)
				}
			});
		}
	})
}

exports.classify = function(req, res, next) {
	var tm = Date.now();
	logger.debug("Received File Request")
	if (!req.files) {
		response_json = {
			message: "Error",
			error: "No files specified for upload."
		}
		logger.error(response_json); // an error occurred
		res.status(HttpStatus.BAD_REQUEST);
		res.json(response_json);
	} else {

		async.map(req.files, function(file, callback) {
			async.waterfall([
				function(cb) {
					fs.readFile(file.path, (err, data) => {

						const bitArray = sjcl.hash.sha256.hash(data);
						const sha256_hexdigest = sjcl.codec.hex.fromBits(bitArray);
						logger.debug(`Original File SHA 256 HexDigest of ${file.originalname} is: ${sha256_hexdigest}`)
						cb(err, sha256_hexdigest)
					})
				},
				function(sha256_hexdigest, cb) {
					var params = {
						TableName: config.get('AWS.DynamoDB.dbConfig.studies_table'),
						IndexName: 'orig_file_sha256_hexdigest-index',
						KeyConditionExpression: 'orig_file_sha256_hexdigest = :orig_file_sha256_hexdigest',
						ExpressionAttributeValues: {
							':orig_file_sha256_hexdigest': sha256_hexdigest
						}
					};
					documentClient.query(params, function(err, data) {
						if (err) {
							logger.error("Error querying dynamodb")
							logger.error(params)
							logger.error(err);
							cb(err)
						} else {
							cb(null, sha256_hexdigest, data)
						}
					});
				},
				function(sha256_hexdigest, data, cb) {
					if (data.Count === 0) {
						file.sha256_hexdigest = sha256_hexdigest
						_write_to_dynamo(file, cb)
					} else {
						cb(null, data.Items[0])
					}
				}
			], function(err, results) {
				callback(err, results)
			})
		}, function(err, resp) {
			if (err) {
				logger.error(err); // an error occurred
				res.json({"message": "Internal Server Error", error : err})
				res.status(HttpStatus.INTERNAL_SERVER_ERROR);
			} else {
				response_json = {
					results: resp
				}
				res.json(response_json);
				res.status(HttpStatus.OK);
			}
		})
	}
}
