'use strict';

angular.module('admin').controller('VideoAdminController', ['$scope', '$stateParams', '$location', 'Authentication', 'AdminVideos',
	function($scope, $stateParams, $location, Authentication, Videos) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if (!$scope.authentication.user) $location.path('/authentication/signin');

		$scope.find = function() {
			$scope.videos = Videos.query();
		};

		$scope.findOne = function() {
			$scope.video = Videos.get({
				videoId: $stateParams.videoId
			});
		};

		$scope.update = function() {
			var video = $scope.video;

			video.$update(function() {
				alert('Video saved');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};
	}
]);
