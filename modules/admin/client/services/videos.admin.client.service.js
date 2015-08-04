'use strict';

//Videos service used for communicating with the videos REST endpoints
angular.module('admin').factory('AdminVideos', ['$resource',
	function($resource) {
		return $resource('api/admin/videos/:videoId', {
			videoId: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
			submit: {
				method: 'POST',
				url: 'api/admin/videos/:videoId/submit',
				params: { videoId: '@_id' }
			},
			download: {
				method: 'GET',
				url: 'api/admin/videos/:videoId/download',
				params: { videoId: '@_id' }
			}
		});
	}
]);
