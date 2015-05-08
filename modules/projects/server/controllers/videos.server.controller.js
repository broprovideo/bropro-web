'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Video = mongoose.model('Video'),
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
 * List of Video
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
 * Get S3 signature - Based on mule uploader
 * This action also will try to resume unfinished uploads
 * Refer to here : https://github.com/cinely/mule-uploader#mule-upload
 */
exports.getS3sign = function(req, res, next) {
	console.log(req.query.filename, req.query.filesize);
	Video.find({
		project: req.query.projectId,
		filename: req.query.filename,
		filesize: req.query.filesize
	}).exec(function(video) {
		if(video) {
			// Return existing video record
			res.set('Content-Type', 'text/html');
			res.jsonp({
				access_key: AWS_ACCESS_KEY,
				key: "file1",
				backup_key: "3543543",
				bucket: S3_BUCKET,
				content_type: "application/octet-stream",
				date: moment().toISOString(),
				region: "us-east-1",
				signature: getSignatureKey(AWS_SECRET_KEY, moment.tz('America/Toronto').format("YYYYMMDD"), "us-east-1", "s3" )
			});
		} else {
			// Make new video
			res.set('Content-Type', 'text/html');
			res.jsonp({
				access_key: AWS_ACCESS_KEY,
				key: "file1",
				backup_key: "3543543",
				bucket: S3_BUCKET,
				content_type: "application/octet-stream",
				date: moment().toISOString(),
				region: "us-east-1",
				signature: getSignatureKey(AWS_SECRET_KEY, moment.tz('America/Toronto').format("YYYYMMDD"), "us-east-1", "s3" )
			});
		}
	});
}

exports.s3chunkLoaded = function(req, res, next) {
	res.sendStatus(200);
}
