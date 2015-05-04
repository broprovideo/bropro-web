'use strict';

// Setting up route
angular.module('videos').config(['$stateProvider',
	function($stateProvider) {
		// Video state routing
		$stateProvider.
		state('home.videos', {
			abstract: true,
			url: '/video',
			template: '<ui-view/>'
		}).
		state('home.videos.list', {
			url: '',
			templateUrl: 'modules/videos/views/list-video.client.view.html'
		}).
		// state('home.videos.create', {
		// 	url: '/create',
		// 	templateUrl: 'modules/videos/views/create-video.client.view.html'
		// }).
		state('home.videos.create', {
			url: '/create',
			templateUrl: 'modules/videos/views/create-video.client.view.html',
			controller: function($scope, $location, Videos) {
				var video = new Videos({
					title: this.title,
					content: this.content
				});
				video.$save(function(response) {
					$location.path('/video/' + response._id);

					$scope.title = '';
					$scope.content = '';
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
		}).
		state('home.videos.view', {
			url: '/:videoId',
			templateUrl: 'modules/videos/views/view-video.client.view.html'
		}).
		state('home.videos.edit', {
			url: '/:videoId/edit',
			templateUrl: 'modules/videos/views/edit-video.client.view.html'
		});
	}
]);
