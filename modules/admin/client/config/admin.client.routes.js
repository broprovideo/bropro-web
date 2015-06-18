'use strict';

// Setting up route
angular.module('admin').config(['$stateProvider',
	function($stateProvider) {
		// Videos state routing
		$stateProvider.
		state('home.admin', {
			abstract: true,
			url: '/admin',
			template: '<ui-view/>'
		}).
		state('home.admin.users', {
			url: '/users',
			abstract: true,
			template: '<ui-view/>'
		}).
		state('home.admin.users.list', {
			url: '',
			templateUrl: 'modules/admin/views/list-users.admin.client.view.html'
		}).

		state('home.admin.videos', {
			url: '/videos',
			abstract: true,
			template: '<ui-view/>'
		}).
		state('home.admin.videos.list', {
			url: '',
			templateUrl: 'modules/admin/views/list-videos.admin.client.view.html'
		}).
		state('home.admin.videos.view', {
			url: '/:videoId',
			templateUrl: 'modules/admin/views/view-video.admin.client.view.html'
		})
	}
]);
