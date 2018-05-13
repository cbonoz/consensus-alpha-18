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
			// logger.debug(obj);
			logger.debug("Query succeeded.");
			res.status(HttpStatus.OK);
			res.json(_.values(obj));
		}
	});
}
