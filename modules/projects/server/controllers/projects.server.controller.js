'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Project = mongoose.model('Project'),
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
 * Create a project
 */
exports.create = function(req, res) {
	var project = new Project(req.body);
	project.user = req.user;

	project.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(project);
		}
	});
};

/**
 * Show the current project
 */
exports.read = function(req, res) {
	res.json(req.project);
};

/**
 * Update a project
 */
exports.update = function(req, res) {
	var project = req.project;

	project.title = req.body.title;
	project.content = req.body.content;

	project.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(project);
		}
	});
};

/**
 * Delete an project
 */
exports.delete = function(req, res) {
	var project = req.project;

	project.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(project);
		}
	});
};

/**
 * List of Videos
 */
exports.list = function(req, res) {
	Project.find().sort('-created').populate('user', 'displayName').exec(function(err, projects) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(projects);
		}
	});
};

/**
 * Project middleware
 */
exports.projectByID = function(req, res, next, id) {
	Project.findById(id).populate('user', 'displayName').exec(function(err, project) {
		if (err) return next(err);
		if (!project) return next(new Error('Failed to load project ' + id));
		req.project = project;
		next();
	});
};


/**
 * Get S3 signature
 *
 */
exports.getS3sign = function(req, res, next) {
	console.log(req.user);
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

exports.s3chunkLoaded = function(req, res, next) {
	console.log(req.user);
	console.log(req.params.chunk);
	res.sendStatus(200);
}
