'use strict';

//Parititions service used for communicating with the videos REST endpoints
angular.module('videos').factory('Partition', ['$resource',
	function($resource) {
		return $resource('api/videos/:videoId/partitions/:partitionId', {
			videoId: '@videoId',
			parititionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
