'use strict';

// Configuring the Projects module
angular.module('projects').run(['Menus',
	function(Menus) {
		// Add the projects dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Projects',
			state: 'home.projects',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'home.projects', {
			title: 'List Projects',
			state: 'home.projects.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'home.projects', {
			title: 'Create Projects',
			state: 'home.projects.create'
		});
	}
]);
