'use strict';

angular.module('videos').controller('VideosController', ['$scope', '$stateParams', '$location', 'Authentication', 'Videos',
	function($scope, $stateParams, $location, Authentication, Videos) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if (!$scope.authentication.user) $location.path('/authentication/signin');

		$scope.uploadProgress = 0;
		$scope.uploadTotal = 100;
		// Videos folders
		var settings = {
			file_input: document.getElementById('files'),
			access_key: 'AKIAINESKCCNAOX7CVHQ',
			content_type: 'application/octet-stream',
			bucket: 'indrasantosa.uploads',
			region: 'us-east-1',
			ajax_base: '/api/partitions',
			extra_params: {
				videoId: $stateParams.videoId,
			},


			max_size: 50 * (1 << 30), // 50 gb
			on_error: function() {

			},
			on_select: function(fileObj) {
				console.log(fileObj);
			},
			on_start: function(fileObj) {
				console.log('starting...');
				console.log(fileObj);
			},
			on_progress: function(bytes_uploaded, bytes_total) {
				$scope.uploadProgress = bytes_uploaded;
				$scope.uploadTotal = bytes_total;
				$scope.$apply();
			},
			on_init: function() {

			},
			on_complete: function() {
				console.log('Upload completed');
			},
			on_chunk_uploaded: function(chunk) {
				console.log(chunk);
			}
		};
		var upload = mule_upload(settings);


		$scope.create = function() {
			var video = new Videos({
				title: this.title,
				content: this.content
			});
			video.$save(function(response) {
				$location.path('videos/' + response._id);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(video) {
			if (video) {
				video.$remove();

				for (var i in $scope.video) {
					if ($scope.video[i] === video) {
						$scope.video.splice(i, 1);
					}
				}
			} else {
				$scope.video.$remove(function() {
					$location.path('video');
				});
			}
		};

		$scope.update = function() {
			var video = $scope.video;
			console.log($scope.video);

			video.$update(function() {
				$location.path('videos/' + video._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.videos = Videos.query();
		};

		$scope.findOne = function() {
			$scope.video = Videos.get({
				videoId: $stateParams.videoId
			});
		};
	}
]);
