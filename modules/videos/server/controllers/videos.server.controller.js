'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Video = mongoose.model('Video'),
	moment = require('moment'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

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
	// If user is admin, show all the video list, else only show videos belongs to him
	var query;
	if(req.user.roles.indexOf('admin') !== -1) {
		query = Video.find();
	} else {
		query = Video.find({user: req.user});
	}

	query.sort('-created').populate('user').exec(function(err, videos) {
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
	Video.findById(id)
	.populate('user')
	.populate('partitions')
	.exec(function(err, video) {
		if (err) return next(err);
		if (!video) return next(new Error('Failed to load video ' + id));
		req.video = video;
		next();
	});
};
