'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Video = mongoose.model('Video'),
	crypto = require('crypto'),
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
 */
exports.getS3sign = function(req, res, next) {
	res.set('Content-Type', 'text/html');
	console.log(req.query.to_sign);
  res.send(createS3Hmac(req.query.to_sign));
}
