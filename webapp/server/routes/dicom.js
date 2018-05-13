const {AWS}	 = require('../common.js');
const s3 = new AWS.S3();
const logger = require('../logger');
const fs = require("fs");
const HttpStatus = require('http-status-codes');
//
const s3BucketName = 'london.data.behold.ai';

exports.dicom_server = function(ctx, next) {
	var s3Key = ctx.query["s3Key"];

	var options = {
    Bucket    : s3BucketName,
    Key    : s3Key,
  };
	logger.info("Received request s3Key: " + s3Key)
	ctx.status = HttpStatus.OK;
	ctx.type = 'binary';
	ctx.body = s3.getObject(options).createReadStream();

	// s3.getObject(options, function(err, data){
  //   if(err) {
	// 		logger.error("NoSuchKey : " + s3Key)
  //     ctx.body = fs.createReadStream('/Users/wakahiu/Dropbox/code/behold/behold-webapp/src/static/404.jpg');
  //   }else {
  //     ctx.body = data
  //  }
	// });
}
