'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/videos');

		$scope.signup = function() {
			$http.post('/api/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/api/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;
                
                $scope.authentication.user._id
                $scope.authentication.user.email

                mixpanel.people.set({
                "$email": $scope.authentication.user.email,    // only special properties need the $
                "$created": $scope.authentication.user.created,
                "$last_login": new Date(),         // properties can be dates...
                })

				// And redirect to the index page
				$location.path('/videos');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
