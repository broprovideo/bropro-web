'use strict';

//Parititions service used for communicating with the videos REST endpoints
angular.module('videos').factory('Parititions', ['$resource',
	function($resource) {
		return $resource('api/videos/partitions/:videoId', {
			parititionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
