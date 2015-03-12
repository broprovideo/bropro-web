'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('home.articles', {
			abstract: true,
			url: '/articles',
			template: '<ui-view/>'
		}).
		state('home.articles.list', {
			url: '',
			templateUrl: 'modules/articles/views/list-articles.client.view.html'
		}).
		state('home.articles.create', {
			url: '/create',
			templateUrl: 'modules/articles/views/create-article.client.view.html'
		}).
		state('home.articles.view', {
			url: '/:articleId',
			templateUrl: 'modules/articles/views/view-article.client.view.html'
		}).
		state('home.articles.edit', {
			url: '/:articleId/edit',
			templateUrl: 'modules/articles/views/edit-article.client.view.html'
		});
	}
]);
