'use strict';

angular.module('videos').controller('VideosController', ['$scope', '$stateParams', '$location', 'Authentication', 'Videos',
	function($scope, $stateParams, $location, Authentication, Videos) {
		$scope.authentication = Authentication;

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

				for (var i in $scope.videos) {
					if ($scope.videos[i] === video) {
						$scope.videos.splice(i, 1);
					}
				}
			} else {
				$scope.video.$remove(function() {
					$location.path('videos');
				});
			}
		};

		$scope.update = function() {
			var video = $scope.video;

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
