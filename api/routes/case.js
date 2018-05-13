const common = require('../common');
const AWS = common.AWS;
const inspect = require('eyes').inspector({
	maxLength: 20000
});
const logger = require('../logger');
const path = require('path');
const s3 = new AWS.S3();
const fs = require('fs');
const uuidv4					= require('uuid/v4');
const HttpStatus = require('http-status-codes');
const config = require('config');
const WebSocket = require('ws');
const redis = require("redis");
const _ = require("lodash");
// redis_client = redis.createClient();

exports.SubscribeTrades = function(req, res, next) {

	redis_client.hgetall("Trades:1", function (err, obj) {
		if (err){
			logger.error(err)
		} else {
			obj = _.values(obj)

			obj = _.map(obj, function(value, key) {
				return JSON.parse(value)
			});
			logger.debug(obj);
			logger.debug("Query succeeded.");
			res.status(HttpStatus.OK);
			res.json(_.values(obj));
		}
	});
}

exports.get_detail = function(req, res, next) {
	logger.debug(req.params)
	var params = {
		TableName : config.get('AWS.DynamoDB.dbConfig.studies_table'),
		FilterExpression: "#uuid = :uuid",
		ExpressionAttributeNames: {
			"#uuid": "uuid",
		},
		ExpressionAttributeValues: { ":uuid": req.params.case_id }
	};

	documentClient.scan(params, function(err, data) {
		if (err) {
			logger.error("Unable to query. Error:", JSON.stringify(err, null, 2));
			res.status(HttpStatus.INTERNAL_SERVER_ERROR);
		} else {
			logger.debug("Query succeeded.");
			res.status(HttpStatus.OK);
			res.json(data.Items[0]);
		}
	});
}

exports.post_rad_report = function(req, res, next) {
	const item = req.body
	var params = {
	  TableName: config.get('AWS.DynamoDB.dbConfig.studies_table'),
	  Key: {
			uuid : item.uuid,
			creation_time : item.creation_time
		},
		UpdateExpression : 'SET #rad_report = :rad_report',
		ReturnValues : 'ALL_NEW',
		ExpressionAttributeNames: { '#rad_report': 'rad_report'},
		ExpressionAttributeValues : {
			":rad_report" : req.body.rad_report
		}
	};

	documentClient.update(params, function(err, data) {
		if (err) {
			logger.error("Unable to query. Error:", JSON.stringify(err, null, 2));
			res.status(HttpStatus.INTERNAL_SERVER_ERROR);
		} else {
			logger.debug("Update succeeded.");
			logger.debug(data);
			res.status(HttpStatus.OK);
			res.json(data.Attributes);
		}
	});
}
