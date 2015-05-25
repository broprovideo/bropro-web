'use strict';

//Parititions service used for communicating with the videos REST endpoints
angular.module('videos').factory('Partitions', ['$resource',
	function($resource) {
		return $resource('api/video/:videoId/partitions/:partitionId', {
			parititionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
