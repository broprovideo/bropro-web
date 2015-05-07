'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			abstract: true,
			templateUrl: 'modules/core/views/menu.client.view.html'
		}).
		state('home.index', {
			url: '/',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html',
		})
		;
	}
]);
