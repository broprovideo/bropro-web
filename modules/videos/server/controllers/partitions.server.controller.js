'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Paritition = mongoose.model('Paritition'),
	crypto = require('crypto'),
	moment = require('moment-timezone'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/*
 * Config VARs
 */
var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

/*
 * Router functions
 * Functions that will be used by routers
 */
function getSignatureKey(key, dateStamp, regionName, serviceName) {
	var kDate = crypto.createHmac('sha256', 'AWS4'+key).update(dateStamp).digest('binary');
	var kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest('binary');
	var kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest('binary');
	var kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest('hex');
	return kSigning;
}

/**
 * Create a paritition
 */
exports.create = function(req, res) {
	var paritition = new Paritition(req.body);
	paritition.user = req.user;

	paritition.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(paritition);
		}
	});
};

/**
 * Show the current paritition
 */
exports.read = function(req, res) {
	res.json(req.paritition);
};

/**
 * Update a paritition
 */
exports.update = function(req, res) {
	var paritition = req.paritition;

	paritition.title = req.body.title;
	paritition.content = req.body.content;

	paritition.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(paritition);
		}
	});
};

/**
 * Delete an paritition
 */
exports.delete = function(req, res) {
	var paritition = req.paritition;

	paritition.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(paritition);
		}
	});
};

/**
 * List of Paritition
 */
exports.list = function(req, res) {
	Paritition.find().sort('-created').populate('user', 'displayName').exec(function(err, videos) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(videos);
		}
	});
};

/**
 * Paritition middleware
 */
exports.partitionByID = function(req, res, next, id) {
	Paritition.findById(id).populate('user', 'displayName').exec(function(err, paritition) {
		if (err) return next(err);
		if (!paritition) return next(new Error('Failed to load paritition ' + id));
		req.paritition = paritition;
		next();
	});
};


/**
 * Get S3 signature - Based on mule uploader
 * This action also will try to resume unfinished uploads
 * Refer to here : https://github.com/cinely/mule-uploader#mule-upload
 */
exports.getS3sign = function(req, res, next) {
	console.log(AWS_SECRET_KEY, moment.tz('America/Virginia').format('YYYYMMDD'), 'us-east-1', 's3');
	Paritition.find({
		project: req.query.projectId,
		filename: req.query.filename,
		filesize: req.query.filesize
	}).exec(function(paritition) {
		if(paritition) {
			// Return existing paritition record
			res.set('Content-Type', 'text/html');
			res.jsonp({
				access_key: AWS_ACCESS_KEY,
				key: 'file1',
				backup_key: '3543543',
				bucket: S3_BUCKET,
				content_type: 'application/octet-stream',
				date: moment().toISOString(),
				region: 'us-east-1',
				signature: getSignatureKey(AWS_SECRET_KEY, moment.tz('America/Virginia').format('YYYYMMDD'), 'us-east-1', 's3' )
			});
		} else {
			// Make new paritition
			res.set('Content-Type', 'text/html');
			res.jsonp({
				access_key: AWS_ACCESS_KEY,
				key: 'file1',
				backup_key: '3543543',
				bucket: S3_BUCKET,
				content_type: 'application/octet-stream',
				date: moment().toISOString(),
				region: 'us-east-1',
				signature: getSignatureKey(AWS_SECRET_KEY, moment.tz('America/Virginia').format('YYYYMMDD'), 'us-east-1', 's3' )
			});
		}
	});
}

exports.s3chunkLoaded = function(req, res, next) {
	res.sendStatus(200);
}
