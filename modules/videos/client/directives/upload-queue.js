'use strict';

var indexOfPartition = function(o, arr) {
	console.log(o);
	console.log(arr);
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].id === o.id) {
				return i;
		}
	}
	return -1;
};

angular.module('videos')
.directive('uploadDropzone', function($timeout) {
	return {
		require: [],
		restrict: 'E',
		scope: {
			onFileDrop: '=',
			ngModel: '='
		},
		link: function(scope, element, attrs, controllers) {
			console.log('File dropzone intialized');
			var model = scope.ngModel;

			var checkSize, isTypeValid, processDragOverOrEnter, validMimeTypes;

			window.uploader = [];
			scope.queue = function(files) {
				var settings = {
					autostart: false,
					access_key: window.app.config.uploaderAccessKey,
					content_type: 'application/octet-stream',
					bucket: window.app.config.uploaderBucketName,
					region: window.app.config.uploaderS3Region,
					ajax_base: '/api/partitions',
					extra_params: {
						videoId: model._id,
					},

					max_size: 50 * (1 << 30), // 50 gb
					on_error: function() {

					},
					on_select: function(fileObj) {

					},
					on_start: function(fileObj) {

					},
					on_progress: function(bytes_uploaded, bytes_total) {

					},
					on_init: function() {

					},
					on_complete: function() {
						this.partition.status='completed';
						scope.$apply();
					},
					on_chunk_uploaded: function(chunk) {

					},
					on_new_upload: function(resp) {
						var partition = this.get_partition();
						partition.uploader = this;
						model.partitions.push(partition);
						this.settings.on_chunk_progress = function(bytes_uploaded, bytes_total) {
							partition.progress = Math.floor(this.get_total_progress()/partition.filesize*100);
							scope.$apply();
						};
					},
					on_resume_upload: function(resp) {

					}
				};

				if(files.length) {
					for (var i = 0; i < files.length; i++) {
				    var file = files[i];

						// For each file list, crosscheck with existing file list

						// after get the reply, prompt user 'yes' or 'no' whether user want to re upload again

						// Make another request to the server to get the list of partition objects that user want to upload

						// Push objects objects and videos to videos.partitions

						settings.file = file;
						model.partitions.push(partition);
						// window.uploader.push(bro_upload(settings));
					}

					scope.$apply();
				}
			};


			processDragOverOrEnter = function(event) {
				if (event !== null) {
					event.stopPropagation();
					event.preventDefault();
				}
				event.dataTransfer.effectAllowed = 'copy';
				return false;
			};

			console.log(element);
			element.bind('dragover', processDragOverOrEnter);
			element.bind('dragenter', processDragOverOrEnter);
			element.bind('drop', function(event) {
				var file, reader;
				if (event !== null) {
					event.preventDefault();
				}
				scope.queue(event.dataTransfer.files);
				return false;
			});
		},
		templateUrl: '/modules/videos/directives/upload-dropzone.html'
	};
})
.directive('uploadList', function($timeout, UploadQueue) {
	return {
		require: [],
		restrict: 'E',
		transclude: true,
		scope: {
			partition: '=partition'
		},
		link: function(scope, elements, attrs, controllers) {
			scope.init = function() {

			};

			scope.helloworld = function() {
				console.log('hellow world');
			};

			$timeout(function() {
				// uploadQueueController.
				var eName = 'input'+scope.partition._id;
		    var inputUpdateSettings = {
					// file_input: document.getElementById(eName),
					autostart: false,
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
						var calculatedProgress = Math.max(Math.floor(bytes_uploaded/bytes_total*100), scope.partition.progress);
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
					var newBroUpload = bro_upload(inputUpdateSettings);
					// window.uploader.push(newBroUpload);
				}
			});
		},
		templateUrl: '/modules/videos/directives/upload-list.html'
	};
});
