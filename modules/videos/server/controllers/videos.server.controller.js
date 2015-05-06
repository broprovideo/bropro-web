'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Video = mongoose.model('Video'),
	crypto = require('crypto'),
	moment = require('moment'),
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

var createS3Hmac = function(data) {
  return crypto.createHmac('sha1', AWS_SECRET_KEY).update(data).digest('base64');
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
	var kDate = crypto.createHmac('sha256', "AWS4"+key).update(dateStamp).digest('binary');
	var kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest('binary');
	var kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest('binary');
	var kSigning = crypto.createHmac('sha256', kService).update("aws4_request").digest('hex');
	return kSigning;
}

/**
 * Create a video
 */
exports.create = function(req, res) {
	var video = new Video(req.body);
	video.user = req.user;

	video.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(video);
		}
	});
};

/**
 * Show the current video
 */
exports.read = function(req, res) {
	res.json(req.video);
};

/**
 * Update a video
 */
exports.update = function(req, res) {
	var video = req.video;

	video.title = req.body.title;
	video.content = req.body.content;

	video.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(video);
		}
	});
};

/**
 * Delete an video
 */
exports.delete = function(req, res) {
	var video = req.video;

	video.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(video);
		}
	});
};

/**
 * List of Videos
 */
exports.list = function(req, res) {
	Video.find().sort('-created').populate('user', 'displayName').exec(function(err, videos) {
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
 * Video middleware
 */
exports.videoByID = function(req, res, next, id) {
	Video.findById(id).populate('user', 'displayName').exec(function(err, video) {
		if (err) return next(err);
		if (!video) return next(new Error('Failed to load video ' + id));
		req.video = video;
		next();
	});
};


/**
 * Get S3 sign
 *
 * 	access_key: "AKIAJVEKGJ4PS7GDE77A"
 *	backup_key: "636452"
 *	bucket: "mule-uploader-demo"
 *	content_type: "application/octet-stream"
 *	date: "2015-05-05T12:34:17.038135"
 *	region: "us-east-1"
 *	signature: "4a870a914051d994306ad617db239cd2b71fc1d6f47adfec410d229c8b986e4e"
 */

var key = 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY';
var dateStamp = '20120215';
var regionName = 'us-east-1';
var serviceName = 'iam';

exports.getS3sign = function(req, res, next) {
	res.set('Content-Type', 'text/html');
	res.jsonp({
		access_key: AWS_ACCESS_KEY,
		key: "file1",
		backup_key: "3543543",
		bucket: S3_BUCKET,
		content_type: "application/octet-stream",
		date: moment().toISOString(),
		region: "us-east-1",
		signature: getSignatureKey(AWS_SECRET_KEY, moment().format("YYYYMMDD"), "us-east-1", "s3" )
	});
}

exports.s3chunckLoaded = function(req, res, next) {

}
