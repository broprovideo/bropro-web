'use strict';

// Configuring the Videos module
angular.module('admin').run(['Menus',
	function(Menus) {
		// Add the videos dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Admin',
			state: 'home.admin',
			type: 'dropdown',
			roles: ['admin']
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'home.admin', {
			title: 'Users',
			state: 'home.admin.users',
			roles: ['admin']
		});

		// Add the dropdown create item
		// Menus.addSubMenuItem('topbar', 'home.admin', {
		// 	title: 'Videos',
		// 	state: 'home.admin.videos.list'
		// });
	}
]);
