'use strict';

angular.module('videos').controller('VideosController', ['$scope', '$stateParams', '$location', 'Authentication', 'Videos',
	function($scope, $stateParams, $location, Authentication, Videos) {
		$scope.authentication = Authentication;

		// Video repos
		var s3Url = 'https://indrasantosa.uploads.s3.amazonaws.com';

		var _e_ = new Evaporate({
        signerUrl: '/api/videos/getS3sign',
        aws_key: 'AKIAINESKCCNAOX7CVHQ',
        bucket: 'indrasantosa.uploads',
    });
		$scope.files = null;

        $('#files').change(function(evt) {

            $scope.files = [];

            var files = evt.target.files;

            for (var i = 0; i < files.length; i++){
                $scope.files.push(files[i]);
            }

            $scope.$apply();
            $scope.files.forEach(function(file){
                var fileKey = 'tmp/' + file.name;
                file.url = s3Url +'/'+ fileKey;

                console.log(file);

                if (file.type === '') {
                    file.type = 'binary/octel-stream';
                }

                file.started = Date.now();

                _e_.add({
                    name: fileKey,
                    file: file,
                    contentType: file.type,
                    xAmzHeadersAtInitiate: {
                        'x-amz-acl': 'public-read'
                    },
                    complete: function() {
                        file.completed = true;
                        $scope.$apply();
                    },
                    progress: function(progress) {

                        // returns percent / 100 with 2 decimal places I.E (10.00)
                        file.progress = (Math.round((progress * 100) * 100) / 100);

                        var currentTime            = Date.now();
                        var progressRemaining      = (100 - file.progress);
                        var progressionRate        = (progressRemaining / file.progress);
                        var timeToCurrentPosition  = (currentTime - file.started);

                        // return seconds left during download
                        file.timeLeft = Math.round((progressionRate * timeToCurrentPosition) / 1000);

                        $scope.$apply();
                    }
                });
            });
        });


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
