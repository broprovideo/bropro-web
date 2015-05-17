'use strict';

angular.module('videos').directive('uploadList', function($timeout) {
	return {
		require: [],
		restrict: 'E',
		transclude: true,
		scope: {
			partition: '=partition'
		},
		link: function(scope, elements, attrs, controllers) {
			$timeout(function() {
				var eName = 'input'+scope.partition._id;
		    var inputUpdateSettings = {
					file_input: document.getElementById(eName),
					access_key: window.app.config.uploaderAccessKey,
					content_type: 'application/octet-stream',
					bucket: window.app.config.uploaderBucketName,
					region: window.app.config.uploaderS3Region,
					ajax_base: '/api/partitions',
					extra_params: {
						videoId: scope.partition.videoId,
					},

					max_size: 50 * (1 << 30), // 50 gb
					on_error: function() {

					},
					on_select: function(fileObj) {

					},
					on_start: function(fileObj) {

					},
					on_progress: function(bytes_uploaded, bytes_total) {
						var calculatedProgress = Math.max(Math.floor(bytes_uploaded/bytes_total*100), scope.partition.progress)
						scope.partition.progress = calculatedProgress;
						scope.$apply();
					},
					on_init: function() {

					},
					on_complete: function() {
						scope.partition.status='completed';
						scope.$apply();
					},
					on_chunk_uploaded: function(chunk) {

					},
					on_new_upload: function(resp) {

					},
					on_resume_upload: function(resp) {

					}
				};
				if(scope.partition.status !== 'completed') {
					window.uploader.push(bro_upload(inputUpdateSettings));
				}
			})
		},
		templateUrl: '/modules/videos/directives/upload-list.html'
	}
});
