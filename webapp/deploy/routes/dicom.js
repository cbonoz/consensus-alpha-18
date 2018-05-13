const {AWS}	 = require('../common.js');
const s3 = new AWS.S3();
const logger = require('../logger');
const fs = require("fs");
const HttpStatus = require('http-status-codes');
//
const s3BucketName = 'data.behold.ai';

exports.dicom_server = function(ctx, next) {
	var s3Key = ctx.query["s3Key"];

	var options = {
    Bucket    : s3BucketName,
    Key    : s3Key,
  };
	logger.info("Received Request s3Key: " + s3Key)
	ctx.status = HttpStatus.OK;
	ctx.type = 'binary';
	ctx.body = s3.getObject(options).createReadStream();
}
