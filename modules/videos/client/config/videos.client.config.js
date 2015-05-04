'use strict';

// Configuring the Articles module
angular.module('videos').run(['Menus',
	function(Menus) {
		// Add the videos dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Videos',
			state: 'home.videos',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'home.videos', {
			title: 'List Videos',
			state: 'home.videos.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'home.videos', {
			title: 'Create Videos',
			state: 'home.videos.create'
		});
	}
]);
