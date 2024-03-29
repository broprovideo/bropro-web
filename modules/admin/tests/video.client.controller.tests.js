'use strict';

(function() {
	// Projects Controller Spec
	describe('ProjectsController', function() {
		// Initialize global variables
		var ProjectsController,
			scope,
			$httpBackend,
			$stateParams,
			$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Projects controller.
			ProjectsController = $controller('ProjectsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one video object fetched from XHR', inject(function(Projects) {
			// Create sample video using the Projects service
			var sampleVideo = new Projects({
				title: 'An Video about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample videos array that includes the new video
			var sampleProjects = [sampleVideo];

			// Set GET response
			$httpBackend.expectGET('api/videos').respond(sampleProjects);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.videos).toEqualData(sampleProjects);
		}));

		it('$scope.findOne() should create an array with one video object fetched from XHR using a articleId URL parameter', inject(function(Projects) {
			// Define a sample video object
			var sampleVideo = new Projects({
				title: 'An Video about MEAN',
				content: 'MEAN rocks!'
			});

			// Set the URL parameter
			$stateParams.articleId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/videos\/([0-9a-fA-F]{24})$/).respond(sampleVideo);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.video).toEqualData(sampleVideo);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Projects) {
			// Create a sample video object
			var sampleVideoPostData = new Projects({
				title: 'An Video about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample video response
			var sampleVideoResponse = new Projects({
				_id: '525cf20451979dea2c000001',
				title: 'An Video about MEAN',
				content: 'MEAN rocks!'
			});

			// Fixture mock form input values
			scope.title = 'An Video about MEAN';
			scope.content = 'MEAN rocks!';

			// Set POST response
			$httpBackend.expectPOST('api/videos', sampleVideoPostData).respond(sampleVideoResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.title).toEqual('');
			expect(scope.content).toEqual('');

			// Test URL redirection after the video was created
			expect($location.path()).toBe('/videos/' + sampleVideoResponse._id);
		}));

		it('$scope.update() should update a valid video', inject(function(Projects) {
			// Define a sample video put data
			var sampleVideoPutData = new Projects({
				_id: '525cf20451979dea2c000001',
				title: 'An Video about MEAN',
				content: 'MEAN Rocks!'
			});

			// Mock video in scope
			scope.video = sampleVideoPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/videos\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/videos/' + sampleVideoPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid articleId and remove the video from the scope', inject(function(Projects) {
			// Create new video object
			var sampleVideo = new Projects({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new videos array and include the video
			scope.videos = [sampleVideo];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/videos\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleVideo);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.videos.length).toBe(0);
		}));
	});
}());
