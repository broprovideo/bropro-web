'use strict';

/**
 * Module dependencies.
 */
var videoPolicy = require('../policies/videos.admin.server.policy'),
	videos = require('../controllers/videos.admin.server.controller');

module.exports = function(app) {
	// Videos collection routes
	app.route('/api/admin/videos').all(videoPolicy.isAllowed)
		.get(videos.list)
		.post(videos.create);

	// Single video routes
	app.route('/api/admin/videos/:videoId').all(videoPolicy.isAllowed)
		.get(videos.read)
		.put(videos.update)
		.delete(videos.delete);

	app.route('/api/admin/videos/:videoId/submit').all(videoPolicy.isAllowed)
		.post(videos.submit);

	// Finish by binding the video middleware
	app.param('videoId', videos.videoByID);
};
