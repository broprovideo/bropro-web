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
					console.log(key);
					// Create and load information to partition
					var partition = new Partition({
						videoId: req.query.videoId,
						originalFileName: req.query.filename,
						filesize: req.query.filesize,
						key: key,
						backupKey: shortid.generate(),
						totalChunk: Math.ceil(req.query.filesize/6291456),
						resultPath: 'https://s3.amazonaws.com/'+config.uploaderOptions.bucket+'/'+key,
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
			// Prepare reply objects with basic required attribute
			var response = {
				access_key: config.uploaderOptions.accessKey,
				key: partition.key,
				backup_key: partition.backupKey,
				bucket: config.uploaderOptions.bucket,
				chunks: partition.chunks,
				content_type: 'application/octet-stream',
				date: moment().toISOString(),
				region: config.uploaderOptions.region,
				signature: getSignatureKey(config.uploaderOptions.secretKey, moment.tz('America/Toronto').format('YYYYMMDD'), config.uploaderOptions.region, 's3' ),
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
 * Finalize partitions after all chunks are uploaded
 */
exports.finalizePartitions = function(req, res) {


}

exports.log = function(req, res) {
	console.log(req);
}

/**
 * Get file metadata once a file has been successfully uploaded into AWS server
 * http://go.bropro.video:3001/?video_url=http://s3.amazonaws.com/beta.bropro/NkTb-idX.mp4
 */
exports.getFileMetadata = function(req, res) {

	var partition = req.partition;

	// Get duration of uploaded item
	var vidRegex = /video\/.*/;
	if(vidRegex.test(partition.type)) {
		// Get metadata from metaserver
		var url = config.metaserver+"/?video="+getPartitionUrl(partition);
		console.log(url);
		request({
			method: 'GET',
			uri: url
		},
		function(error, response, body) {
			if(error) {
				// TODO Handle error properly
				console.log(error)
			} else {
				Partition.findById(partition._id, function(err, part) {
					if(err) {
						// TODO handle error properly
					} else {
						part.metadata = response;
						console.log(response);
						console.log('Saving metadata');
						part.save();
					}
				});
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
		resultPath: 'https://s3.amazonaws.com/'+config.uploaderOptions.bucket+'/'+key,
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
