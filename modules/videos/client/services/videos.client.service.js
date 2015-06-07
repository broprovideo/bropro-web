'use strict';

//Videos service used for communicating with the videos REST endpoints
angular.module('videos').factory('Videos', ['$resource',
	function($resource) {
		return $resource('api/videos/:videoId', {
			videoId: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
			submit: {
				method: 'POST',
				url: 'api/videos/:videoId/submit',
				params: { videoId: '@_id' }
			}
		});
	}
]);
