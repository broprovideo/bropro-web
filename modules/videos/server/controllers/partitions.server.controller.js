'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Partition = mongoose.model('Partition'),
	Video = mongoose.model('Video'),
	crypto = require('crypto'),
	shortid = require('shortid'),
	async = require('async'),
	moment = require('moment-timezone'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/*
 * Config AWS constatats
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

function getFileExtension(filename) {
	return filename.split('.').pop();
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

				// Create and load information to partition
				var partition = new Partition({
					videoId: req.query.videoId,
					originalFileName: req.query.filename,
					filesize: req.query.filesize,
					key: shortid.generate() + '.' + getFileExtension(req.query.filename),
					backupKey: shortid.generate(),
					totalChunk: Math.ceil(req.query.filesize/6291456),
					partition.user: req.user
				});

				// Save Partition, save when done
				partition.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						// Find partitions to the video partitions
						Video.findById(req.query.videoId).exec(function(err, video) {
							video.partitions.push(partition);
							video.save(function(err) {
								if (err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								} else {
									callback(null, err, partition)
								}
							});
						});
					}
				});
			}
		},
		function(err, partition) {
			// Prepare reply objects with basic required attribute
			var response = {
				access_key: AWS_ACCESS_KEY,
				key: partition.key,
				backup_key: partition.backupKey,
				bucket: S3_BUCKET,
				chunks: partition.chunks,
				content_type: 'application/octet-stream',
				date: moment().toISOString(),
				region: 'us-east-1',
				signature: getSignatureKey(AWS_SECRET_KEY, moment.tz('America/Virginia').format('YYYYMMDD'), 'us-east-1', 's3' )
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
}

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
			// Update uploaded partition
			partition.chunks.push(req.query.chunk);
			if(partition.totalChunk && partition.chunks.length === partition.totalChunk) {
				partition.status = 'completed';
				partition.resultPath = 'https://s3.amazonaws.com/'+S3_BUCKET+'/'+partition.key;
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
			})

		}
	});
}
