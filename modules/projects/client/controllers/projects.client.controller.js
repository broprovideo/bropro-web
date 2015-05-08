'use strict';

angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects',
	function($scope, $stateParams, $location, Authentication, Projects) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if (!$scope.authentication.user) $location.path('/authentication/signin');

		// Project folders
		var settings = {
			file_input: document.getElementById("files"),
			access_key: "AKIAINESKCCNAOX7CVHQ",
			content_type: "application/octet-stream",
			bucket: "indrasantosa.uploads",
			region: "us-east-1",
			ajax_base: '/api/videos',
			extra_params: {
				projectId: $stateParams.projectId,
			},


			max_size: 50 * (1 << 30), // 50 gb
			on_error: function() {

			},
			on_select: function(fileObj) {
				console.log(fileObj);
			},
			on_start: function(fileObj) {
				console.log("starting...");
				console.log(fileObj)
			},
			on_progress: function(bytes_uploaded, bytes_total) {
				console.log("Uploading ", bytes_uploaded, " of ", bytes_total)
			},
			on_init: function() {

			},
			on_complete: function() {
				console.log('Upload completed');
			},
			on_chunk_uploaded: function() {
				$('#log').prepend("Chunk finished uploading\n");
			}
		};
		var upload = mule_upload(settings);


		$scope.create = function() {
			var project = new Projects({
				title: this.title,
				content: this.content
			});
			project.$save(function(response) {
				$location.path('projects/' + response._id);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(project) {
			if (project) {
				project.$remove();

				for (var i in $scope.project) {
					if ($scope.project[i] === project) {
						$scope.project.splice(i, 1);
					}
				}
			} else {
				$scope.project.$remove(function() {
					$location.path('project');
				});
			}
		};

		$scope.update = function() {
			var project = $scope.project;
			console.log($scope.project);

			project.$update(function() {
				$location.path('projects/' + project._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.projects = Projects.query();
		};

		$scope.findOne = function() {
			$scope.project = Projects.get({
				projectId: $stateParams.projectId
			});
		};
	}
]);
