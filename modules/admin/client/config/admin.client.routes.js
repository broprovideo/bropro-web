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
			templateUrl: 'modules/admin/views/list-users.admin.client.view.html'
		})
	}
]);
