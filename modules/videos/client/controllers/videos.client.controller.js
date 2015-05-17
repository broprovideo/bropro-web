'use strict';

angular.module('videos').controller('VideosController', ['$scope', '$stateParams', '$location', 'Authentication', 'Videos',
	function($scope, $stateParams, $location, Authentication, Videos) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if (!$scope.authentication.user) $location.path('/authentication/signin');

		function indexOfPartition(o, arr) {
			console.log(o);
			console.log(arr);
			for (var i = 0; i < arr.length; i++) {
        if (arr[i].id == o.id) {
            return i;
        }
    	}
    	return -1;
		}

		window.uploader = [];
		$scope.queue = function(element) {
			if(element.files.length) {
				for (var i = 0; i < element.files.length; i++) {
			    var file = element.files[i];
			    var settings = {
						file: file,
						access_key: window.app.config.uploaderAccessKey,
						content_type: 'application/octet-stream',
						bucket: window.app.config.uploaderBucketName,
						region: window.app.config.uploaderS3Region,
						ajax_base: '/api/partitions',
						extra_params: {
							videoId: $stateParams.videoId,
						},

						max_size: 50 * (1 << 30), // 50 gb
						on_error: function() {

						},
						on_select: function(fileObj) {

						},
						on_start: function(fileObj) {

						},
						on_progress: function(bytes_uploaded, bytes_total) {

						},
						on_init: function() {

						},
						on_complete: function() {
							this.partition.status='completed';
							$scope.$apply();
						},
						on_chunk_uploaded: function(chunk) {

						},
						on_new_upload: function(resp) {
							var partition = this.get_partition();
							partition.uploader = this;
							$scope.video.partitions.push(partition);
							this.settings.on_chunk_progress = function(bytes_uploaded, bytes_total) {
								partition.progress = Math.floor(this.get_total_progress()/partition.filesize*100);
								$scope.$apply();
							}
						},
						on_resume_upload: function(resp) {
							var partition = $scope.video.partitions[indexOfPartition(resp.partition, $scope.video.partitions)];
							partition.uploader = this;
							this.settings.on_chunk_progress = function(bytes_uploaded, bytes_total) {
								partition.progress = Math.floor(this.get_total_progress()/partition.filesize*100);
								$scope.$apply();
							}
						}
					};
					window.uploader.push(bro_upload(settings));
				}
				$scope.$apply();
			}
		}

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
				$location.path('videos/' + video._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.videos = Videos.query();
			var upload = mule_upload(settings);
		};

		$scope.findOne = function() {
			$scope.video = Videos.get({
				videoId: $stateParams.videoId
			});
		};
	}
]);
