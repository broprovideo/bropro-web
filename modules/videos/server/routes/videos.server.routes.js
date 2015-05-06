'use strict';

/**
 * Module dependencies.
 */
var videoPolicy = require('../policies/videos.server.policy'),
	videos = require('../controllers/videos.server.controller');

module.exports = function(app) {
	// Videos collection routes
	app.route('/api/videos').all(videoPolicy.isAllowed)
		.get(videos.list)
		.post(videos.create);

	// Get S3 Hmac signature
	app.route('/api/videos/signing_key/')
		.get(videos.getS3sign);
		app.route('/api/videos/chunk_loaded/')
			.get(videos.s3chunckLoaded);

	// Single video routes
	app.route('/api/videos/:videoId').all(videoPolicy.isAllowed)
		.get(videos.read)
		.put(videos.update)
		.delete(videos.delete);

	// Finish by binding the video middleware
	app.param('videoId', videos.videoByID);
};
