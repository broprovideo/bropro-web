'use strict';

/**
 * Module dependencies.
 */
var projectPolicy = require('../policies/videos.server.policy'),
	videos = require('../controllers/videos.server.controller');

module.exports = function(app) {
	// Projects collection routes
	app.route('/api/videos').all(projectPolicy.isAllowed)
		.get(videos.list)
		.post(videos.create);

	// Mule-uploader routes
	app.route('/api/videos/signing_key/')
		.get(videos.getS3sign);
	app.route('/api/videos/chunk_loaded/')
		.get(videos.s3chunkLoaded);

	// Single project routes
	app.route('/api/videos/:videoId').all(projectPolicy.isAllowed)
		.get(videos.read)
		.put(videos.update)
		.delete(videos.delete);

	// Finish by binding the project middleware
	app.param('videoId', videos.videoByID);
};
