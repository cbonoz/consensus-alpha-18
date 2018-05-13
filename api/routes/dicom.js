const {AWS}	 = require('../common.js');
const dynamodb = new AWS.DynamoDB();
const s3 = new AWS.S3();
const logger = require('../logger');
const async = require("async");
const fs = require("fs");
const path = require('path');
const request = require('request');
const faker = require("faker");
const uuidv4					= require('uuid/v4');
const _ = require('lodash');
const HttpStatus = require('http-status-codes');

const s3BucketName = 'data.behold.ai';

exports.dicom_server = function(req, res, next) {
	var tm = Date.now();
	logger.debug("Received Image Request")
	response_json = {
		results: "UIUIUI"
	}
	var url = "/Users/wakahiu/Dropbox/test_images_a/normal/00001104_015.png";
	var img = fs.readFileSync(url);
	res.status(HttpStatus.OK);
	res.end(img, 'binary');
}
