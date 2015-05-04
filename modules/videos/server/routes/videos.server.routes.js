'use strict';

/**
 * Module dependencies.
 */
var articlesPolicy = require('../policies/videos.server.policy'),
	videos = require('../controllers/videos.server.controller');

module.exports = function(app) {
	// Articles collection routes
	app.route('/api/videos').all(articlesPolicy.isAllowed)
		.get(videos.list)
		.post(videos.create);

	// Single article routes
	app.route('/api/videos/:articleId').all(articlesPolicy.isAllowed)
		.get(videos.read)
		.put(videos.update)
		.delete(videos.delete);

	// Finish by binding the article middleware
	app.param('articleId', videos.articleByID);
};
