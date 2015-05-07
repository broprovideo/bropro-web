'use strict';

/**
 * Module dependencies.
 */
var projectPolicy = require('../policies/projects.server.policy'),
	projects = require('../controllers/projects.server.controller');

module.exports = function(app) {
	// Projects collection routes
	app.route('/api/projects').all(projectPolicy.isAllowed)
		.get(projects.list)
		.post(projects.create);

	// Single project routes
	app.route('/api/projects/:projectId').all(projectPolicy.isAllowed)
		.get(projects.read)
		.put(projects.update)
		.delete(projects.delete);

	// Finish by binding the project middleware
	app.param('projectId', projects.projectByID);
};
