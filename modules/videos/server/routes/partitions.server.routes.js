'use strict';

/**
 * Module dependencies.
 */
var partitionPolicy = require('../policies/partitions.server.policy'),
	videos = require('../controllers/videos.server.controller'),
	partitions = require('../controllers/partitions.server.controller');

module.exports = function(app) {

	// Mule-uploader routes
	app.route('/api/partitions/signing_key/')
		.get(partitions.getS3sign);
	app.route('/api/partitions/chunk_loaded/')
		.get(partitions.s3chunkLoaded);

	// Partitions collection routes
	app.route('/api/videos/:videoId/partitions').all(partitionPolicy.isAllowed)
		.get(partitions.list)
		.post(partitions.create);

	// Single video routes
	app.route('/api/videos/:videoId/partitions/:partitionId').all(partitionPolicy.isAllowed)
		.get(partitions.read)
		.put(partitions.update)
		.delete(partitions.delete);

	// Finish by binding the video middleware
	app.param('partitionId', partitions.partitionByID);
	app.param('videoId', videos.videoByID);
};
