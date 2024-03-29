'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Videos Permissions
 */
exports.invokeRolesPolicies = function() {
	acl.allow([{
		roles: ['admin'],
		allows: [{
			resources: '/api/videos',
			permissions: '*'
		}, {
			resources: '/api/videos/:videoId',
			permissions: '*'
		}, {
			resources: '/api/videos/:videoId/submit',
			permissions: '*'
		}, {
			resources: '/api/videos/:videoId/download',
			permissions: '*'
		}]
	}, {
		roles: ['user'],
		allows: [{
			resources: '/api/videos',
			permissions: ['get', 'post']
		}, {
			resources: '/api/videos/:videoId',
			permissions: ['get']
		}, {
			resources: '/api/videos/:videoId/submit',
			permissions: ['post']
		}]
	}]);
};

/**
 * Check If Videos Policy Allows
 */
exports.isAllowed = function(req, res, next) {
	var roles = (req.user) ? req.user.roles : ['guest'];

	// If an video is being processed and the current user created it then allow any manipulation
	if (req.video && req.user && req.video.user.id === req.user.id) {
		return next();
	}

	// Check for user roles
	acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
		if (err) {
			// An authorization error occurred.
			return res.status(500).send('Unexpected authorization error');
		} else {
			if (isAllowed) {
				// Access granted! Invoke next middleware
				return next();
			} else {
				return res.status(403).json({
					message: 'User is not authorized'
				});
			}
		}
	});
};
