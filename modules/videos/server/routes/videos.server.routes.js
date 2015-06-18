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

	// Single video routes
	app.route('/api/videos/:videoId').all(videoPolicy.isAllowed)
		.get(videos.read)
		.put(videos.update)
		.delete(videos.delete);

	app.route('/api/videos/:videoId/submit').all(videoPolicy.isAllowed)
		.post(videos.submit);

	app.route('/api/videos/:videoId/download').all(videoPolicy.isAllowed)
		.get(videos.download);

	// Finish by binding the video middleware
	app.param('videoId', videos.videoByID);
};
