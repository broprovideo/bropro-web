'use strict';

angular.module('videos').controller('VideosController', ['$scope', '$stateParams', '$location', 'Authentication', 'Videos', 'UploadQueue',
	function($scope, $stateParams, $location, Authentication, Videos, UploadQueue) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if (!$scope.authentication.user) $location.path('/authentication/signin');

		$scope.create = function() {
			var video = new Videos({
				title: this.title,
			});
			video.$save(function(response) {
				$location.path('videos/' + response._id + '/edit');

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
				//$location.path('videos/' + video._id);
				alert('Video saved');
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
