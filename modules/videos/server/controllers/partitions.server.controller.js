'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	_ = require('lodash'),
	mongoose = require('mongoose'),
	Partition = mongoose.model('Partition'),
	Video = mongoose.model('Video'),
	crypto = require('crypto'),
	shortid = require('shortid'),
	async = require('async'),
	request = require('request'),
	s3PublicUrl = require('node-s3-public-url'),
	moment = require('moment-timezone'),
	config = require(path.resolve('./config/config')),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

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

function getFileExtension(filename) {
	return filename.split('.').pop();
}

function getPartitionUrl(partition) {
	var url = partition.resultPath;
	url = url.replace('https', 'http');
	return url;
}

function getS3Date(region) {
	var s3MomentTimezone = {
		'us-east-1': 'America/New_York',
		'us-west-2': 'America/Los_Angeles',
		'us-west-1': 'America/Los_Angeles',
		'eu-west-1': 'Europe/Dublin',
		'eu-central-1': 'Europe/Berlin',
		'ap-southeast-1': 'Asia/Singapore',
		'ap-southeast-2': 'Australia/Sydney',
		'ap-northeast-1': 'Asia/Tokyo',
		'sa-east-1': 'America/Sao_Paulo'
	};
	var awsDate = moment().tz(s3MomentTimezone[region]);
	return new Date(awsDate.year(), awsDate.month(), awsDate.date(), awsDate.hour(), awsDate.minute(), awsDate.second());
}

/**
 * Get S3 signature - Based on mule uploader
 * This action also will try to resume unfinished uploads
 * Refer to here : https://github.com/cinely/mule-uploader#mule-upload
 */
exports.getS3sign = function(req, res, next) {
	async.waterfall([
		function(callback) {
			// Try to find related partition else create new
			Partition.findOne({
				videoId: req.query.videoId,
				originalFileName: req.query.filename,
				filesize: req.query.filesize,
				status: 'inprogress'
			}).exec(function(err, partition) {
				callback(null, err, partition);
			});
		},
		function(err, partition, callback) {
			//Check if partition is found
			if(partition) {
				callback(null, err, partition);
			} else {

				Video.findById(req.query.videoId).exec(function(err, video) {
					var key = req.user.email+'/'+video.title+'-'+video.id+'/'+ req.query.filename;
					// Create and load information to partition
					var partition = new Partition({
						videoId: req.query.videoId,
						originalFileName: req.query.filename,
						filesize: req.query.filesize,
						key: key,
						backupKey: shortid.generate(),
						totalChunk: Math.ceil(req.query.filesize/6291456),

						// Sample s3 public url : https://s3-us-west-2.amazonaws.com/testing.bropro/indrasantosa%40live.com/Testing-Ny-l6lQ8d/IMG_0744+2.JPG
						resultPath: 'https://s3-'+config.uploaderOptions.region+'.amazonaws.com/'+config.uploaderOptions.bucket+'/'+key,
						user: req.user
					});

					// Save Partition, save when done
					partition.save(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							// Find partitions to the video partitions
							video.partitions.push(partition);
							video.save(function(err) {
								if (err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								} else {
									callback(null, err, partition);
								}
							});
						}
					});

				});
			}
		},
		function(err, partition) {

			var s3Date = getS3Date(config.uploaderOptions.region);

			// Prepare reply objects with basic required attribute
			var response = {
				access_key: config.uploaderOptions.accessKey,
				key: partition.key,
				backup_key: partition.backupKey,
				bucket: config.uploaderOptions.bucket,
				chunks: partition.chunks,
				content_type: 'application/octet-stream',
				date: s3Date.toISOString(),
				region: config.uploaderOptions.region,
				signature: getSignatureKey(config.uploaderOptions.secretKey, moment(s3Date).format('YYYYMMDD'), config.uploaderOptions.region, 's3' ),
				partition: partition
			};
			// Add optional attribute
			if(partition.uploadId) {
				response.upload_id = partition.uploadId;
			}

			// Send response
			res.set('Content-Type', 'text/html');
			res.jsonp(response);
		}
	]);
};

/**
 * Partition handler
 */
exports.s3chunkLoaded = function(req, res, next) {
	// Find existing partition
	Partition.findOne({
		videoId: req.query.videoId,
		originalFileName: req.query.filename,
		filesize: req.query.filesize,
		status: 'inprogress'
	}).exec(function(err, partition) {
		if(err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log({
				videoId: req.query.videoId,
				originalFileName: req.query.filename,
				filesize: req.query.filesize,
				status: 'inprogress'
			});
			// Update uploaded partition
			partition.chunks.push(req.query.chunk);
			if(partition.totalChunk && partition.chunks.length === partition.totalChunk) {
				partition.status = 'completed';
			}
			if(!partition.uploadId) {
				partition.uploadId = req.query.upload_id;
			}

			// Save updated partition
			partition.save(function(err) {
				if(err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.sendStatus(200);
				}
			});

		}
	});
};

/**
 * Get file metadata once a file has been successfully uploaded into AWS server
 * http://go.bropro.video:3001/?video_url=http://s3.amazonaws.com/beta.bropro/NkTb-idX.mp4
 */
exports.getFileMetadata = function(req, res) {

	var partition = req.partition;

	// console.log('Getting metadata for ', partition);

	// Get duration of uploaded item
	var vidRegex = /video\/.*/;
	console.log(partition, vidRegex.test(partition.type), partition.type);
	if(vidRegex.test(partition.type)) {
		// Get metadata from metaserver
		var url = config.metaserver+"/?video_url="+getPartitionUrl(partition);
		request({
			method: 'GET',
			uri: url
		},
		function(error, response, body) {
			if(error) {
				// TODO Handle error properly
				console.log(error)
			} else {
				partition.metadata = JSON.parse(body).format;
				console.log('Saving metadata', partition.metadata);
				partition.save();
			}
		});
	}

}

/**
 * Create a partition
 */
exports.create = function(req, res) {
	var video = req.video;
	var key = req.user.email+'/'+video.title+'-'+video.id+'/'+ req.body.originalFileName;

	var partition = new Partition({
		videoId: req.body.videoId,
		originalFileName: req.body.originalFileName,
		filesize: req.body.filesize,
		type: req.body.type,
		key: key,
		backupKey: shortid.generate(),
		totalChunk: Math.ceil(req.body.filesize/6291456),
		resultPath: 'https://s3-'+config.uploaderOptions.region+'.amazonaws.com/'+config.uploaderOptions.bucket+'/'+s3PublicUrl(key),
		user: req.user
	});

	partition.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			video.partitions.push(partition);
			video.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.json(partition);
				}
			});
		}
	});
};

/**
 * Show the current partition
 */
exports.read = function(req, res) {
	res.json(req.partition);
};

/**
 * Update a partition
 */
exports.update = function(req, res) {
	var partition = req.partition;

	partition = _.extends(partition, req.body);

	partition.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(partition);
		}
	});
};

/**
 * Delete an partition
 */
exports.delete = function(req, res) {
	var partition = req.partition;
	var video = req.video;

	if(video.status !== 'submitted') {
		partition.remove(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(partition);
			}
		});
	} else {
		return res.status(400).send({
			message: 'Unable to delete submitted video footage'
		});
	}
};

/**
 * List of Videos
 */
exports.list = function(req, res) {
	// If user is admin, show all the partition list, else only show videos belongs to him
	var query;
	if(req.video) {
		query = Partition.find();
	} else {
		query = Partition.find({video: req.video});
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

exports.partitionByResourceName = function(req, res, next) {

	// Get resource id
	var resp = req.body;
	if(resp.status == 'success') {
		console.log(resp);
		Partition.findOne({ resultPath: resp.data.publicUrl }).exec(function(err, partition) {
			req.partition = partition;
			next();
		});
	}

}

/**
 * Video middleware
 */
exports.partitionByID = function(req, res, next, id) {
	Partition.findById(id)
	.exec(function(err, partition) {
		if (err) return next(err);
		if (!partition) return next(new Error('Failed to load partition ' + id));
		req.partition = partition;
		next();
	});
};
