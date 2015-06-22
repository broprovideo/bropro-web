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
			var video = $scope.video;
			swal({
				title: 'Delete this videos, bro?',
				text: 'You wont be able to recover this item',
				type: 'warning',
				showCancelButton: true,
				confirmButtonCollor: '#E61E25',
				confirmButtonText: 'Yep!',
				cancelButtonText: 'Nope, just kidding',
				closeOnConfirm: false,
				closeOnCancel: true
			},
			function(isConfirm) {
				if (isConfirm) {
					if(video) {
						video.$remove();

						for (var i in $scope.video) {
							if ($scope.video[i] === video) {
								$scope.video.splice(i, 1);
							}
						}
						$location.path('video');
						swal({
							title: 'Deleted!',
							text: 'Your file has been deleted',
							type: 'success',
							timer: 1500,
							showConfirmButton: false
						});
					} else {
						swal({
							title: 'Oooops!',
							text: 'Something wrong when we want to delete the file',
							type: 'error',
							timer: 1500,
							showConfirmButton: false
						});
					}
				}
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

		$scope.submit = function() {
			var video = $scope.video;

			swal({
				title: 'Done, bro?',
				text: 'Make sure you upload all your footage and music that you want',
				type: 'warning',
				showCancelButton: true,
				confirmButtonCollor: '#E61E25',
				confirmButtonText: 'Let\'s do this!',
				cancelButtonText: 'I still need to upload stuffs',
				closeOnConfirm: false,
				closeOnCancel: true,
			},
			function(isConfirm) {

				if (isConfirm) {
					video.$submit(function() {
						mixpanel.track("Video Created", {
                          "Video Title": video.title,
						});
						swal({
							title: 'Success!',
							text: 'Take a seat back for a moment while we make you a hero',
							type: 'success',	
							timer: 1500,
							showConfirmButton: false
						});
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
						swal({
							title: 'Oooops!',
							text: 'Something wrong when we want to submit this video',
							type: 'error',
							timer: 1500,
							showConfirmButton: false
						});
					});
				}
			});

		}

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
