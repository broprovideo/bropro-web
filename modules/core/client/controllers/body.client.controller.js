'use strict';

angular.module('core').controller('BodyController', ['$scope', '$state', 'Authentication',
	function($scope, $state, Authentication) {
		// Expose view variables
		$scope.$state = $state;
	}
]);
