'use strict';

// Configuring the Videos module
angular.module('videos').run(['Menus',
	function(Menus) {
		// Add the videos dropdown item
		Menus.addMenuItem('topbar', {
			title: 'My Videos',
			state: 'home.videos',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'home.videos', {
			title: 'My Videos',
			state: 'home.videos.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'home.videos', {
			title: 'Create New',
			state: 'home.videos.create'
		});
	}
]);
