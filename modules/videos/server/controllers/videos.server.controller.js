'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Video = mongoose.model('Video'),
	moment = require('moment'),
	mime = require('mime'),
	nodemailer = require('nodemailer'),
	config = require(path.resolve('./config/config')),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

	var BucketZip = require('bucket-zip');
	var bucketZip = BucketZip.connect({
	  key: config.S3.accessKey,
	  secret: config.S3.secretKey,
	  bucket: config.S3.bucket
	});
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

	if(video.status === 'submitted') {
		return next(new Error('unable to delete submitted video'));
	}

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
 * List of Videos
 */
exports.submit = function(req, res, next) {
	// Submit video for processing
	var video = req.video;
	if(video.status == 'submitted')
		return next(new Error('Failed to load video ' + id));

	video.status = 'submitted';

	video.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			// send email to user
			res.render(path.resolve('modules/videos/server/templates/video-submitted'), {
				email: req.user.email,
				appName: config.app.title,
				projectName: req.video.title,
				url: 'http://' + req.headers.host + '/videos/' + req.video._id
			}, function(err, emailHTML) {
				if(err) console.log(err);
				var smtpTransport = nodemailer.createTransport(config.mailer.options);
				var mailOptions = {
					to: 'tudor@bropro.video',
					from: config.mailer.from,
					subject: 'A Video has been just submitted',
					html: emailHTML
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					if(err) {
						console.log(err);
					}	else {
						console.log("Email about user"+req.user.email+" has been sent to admin");
					}
				});
			});

			res.json(video);
		}
	});



};

/**
 * Video download
 */
exports.download = function(req, res) {
	var url = req.user.email+'/'+req.video.title+'-'+req.video.id;
	var filename = req.video.title;
	var mimetype = mime.extension('application/zip');

	res.setHeader('Content-disposition', 'attachment; filename=' + filename + '.zip');
  res.setHeader('Content-type', mimetype);

	bucketZip(url).pipe(res);
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
