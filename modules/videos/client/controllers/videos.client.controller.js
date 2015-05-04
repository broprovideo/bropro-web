'use strict';

angular.module('videos').controller('VideosController', ['$scope', '$stateParams', '$location', 'Authentication', 'Videos',
	function($scope, $stateParams, $location, Authentication, Videos) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var article = new Videos({
				title: this.title,
				content: this.content
			});
			article.$save(function(response) {
				$location.path('videos/' + response._id);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(article) {
			if (article) {
				article.$remove();

				for (var i in $scope.videos) {
					if ($scope.videos[i] === article) {
						$scope.videos.splice(i, 1);
					}
				}
			} else {
				$scope.article.$remove(function() {
					$location.path('videos');
				});
			}
		};

		$scope.update = function() {
			var article = $scope.article;

			article.$update(function() {
				$location.path('videos/' + article._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.videos = Videos.query();
		};

		$scope.findOne = function() {
			$scope.article = Videos.get({
				articleId: $stateParams.articleId
			});
		};
	}
]);
