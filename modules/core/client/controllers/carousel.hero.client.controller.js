'use strict';

angular.module('core').controller('HeroSliderController', ['$scope', '$state',
	function($scope, $state) {
		// Expose view variables
		$scope.$state = $state;

		$scope.slides = [
			{
				name: 'Indra 1'
			},
			{
				name: 'Indra 2'
			}
		];
	}
]);
