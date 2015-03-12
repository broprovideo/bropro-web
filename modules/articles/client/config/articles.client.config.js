'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
	function(Menus) {
		// Add the articles dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Articles',
			state: 'home.articles',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'home.articles', {
			title: 'List Articles',
			state: 'home.articles.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'home.articles', {
			title: 'Create Articles',
			state: 'home.articles.create'
		});
	}
]);
