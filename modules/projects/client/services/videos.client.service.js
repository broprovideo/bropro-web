'use strict';

//Projects service used for communicating with the videos REST endpoints
angular.module('projects').factory('Videos', ['$resource',
	function($resource) {
		return $resource('api/videos/:videoId', {
			projectId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
