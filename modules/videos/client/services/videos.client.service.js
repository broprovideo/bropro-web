'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('videos').factory('Videos', ['$resource',
	function($resource) {
		return $resource('api/videos/:videosId', {
			articleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
