'use strict';

// Setting up route
angular.module('projects').config(['$stateProvider',
	function($stateProvider) {
		// Project state routing
		$stateProvider.
		state('home.projects', {
			abstract: true,
			url: '/projects',
			template: '<ui-view/>'
		}).
		state('home.projects.list', {
			url: '',
			templateUrl: 'modules/projects/views/list-project.client.view.html'
		}).
		// state('home.projects.create', {
		// 	url: '/create',
		// 	templateUrl: 'modules/projects/views/create-project.client.view.html'
		// }).
		state('home.projects.create', {
			url: '/create',
			templateUrl: 'modules/projects/views/create-project.client.view.html',
			controller: function($scope, $location, Videos) {
				var project = new Videos({
					title: this.title,
					content: this.content
				});
				project.$save(function(response) {
					$location.path('/projects/' + response._id);

					$scope.title = '';
					$scope.content = '';
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
		}).
		state('home.projects.view', {
			url: '/:projectId',
			templateUrl: 'modules/projects/views/view-project.client.view.html'
		}).
		state('home.projects.edit', {
			url: '/:projectId/edit',
			templateUrl: 'modules/projects/views/edit-project.client.view.html'
		});
	}
]);
