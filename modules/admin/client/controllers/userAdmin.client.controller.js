'use strict';

angular.module('admin').controller('UserAdminController', ['$scope', '$stateParams', '$location', 'Authentication', 'Users',
	function($scope, $stateParams, $location, Authentication, Users) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if (!$scope.authentication.user) $location.path('/authentication/signin');

		$scope.find = function() {
			$scope.users = Users.query();
		};

		// $scope.findOne = function() {
		// 	$scope.video = Videos.get({
		// 		videoId: $stateParams.videoId
		// 	});
		// };
	}
]);
