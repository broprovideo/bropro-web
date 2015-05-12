'use strict';

// Setting up route
angular.module('videos').config(['$stateProvider',
	function($stateProvider) {
		// Videos state routing
		$stateProvider.
		state('home.videos', {
			abstract: true,
			url: '/videos',
			template: '<ui-view/>'
		}).
		state('home.videos.list', {
			url: '',
			templateUrl: 'modules/videos/views/list-video.client.view.html'
		}).
		state('home.videos.create', {
			url: '/create',
			templateUrl: 'modules/videos/views/create-video.client.view.html',
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
