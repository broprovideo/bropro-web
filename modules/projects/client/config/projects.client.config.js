'use strict';

// Configuring the Projects module
angular.module('projects').run(['Menus',
	function(Menus) {
		// Add the projects dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Videos',
			state: 'home.projects',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'home.projects', {
			title: 'My Videos',
			state: 'home.projects.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'home.projects', {
			title: 'Create New',
			state: 'home.projects.create'
		});
	}
]);
