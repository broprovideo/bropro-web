'use strict';

window.uploader = [];

var getIndexByFilename = function(name, array) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].originalFileName === name) {
				return i;
		}
	}
	return -1;
}

angular.module('videos')
.directive('uploadDropzone', function($timeout, UploadQueue, Partition) {
	return {
		require: [],
		restrict: 'E',
		scope: {
			onFileDrop: '=',
			ngModel: '='
		},
		transclude: true,
		controller: function($scope, $element) {
			console.log('File dropzone intialized');
			var model = $scope.ngModel;

			var checkSize, isTypeValid, processDragOverOrEnter, validMimeTypes;

			$scope.queue = function(files) {

				if(files.length) {
					var fileList = [];
					for (var i = 0; i < files.length; i++) {
						fileList.push(files[i]);
					}

					fileList.forEach(function(file) {

						// For each file list, crosscheck with existing file list
						var index = getIndexByFilename(file.name, model.partitions);
						var item = model.partitions[index];

						// after get the reply, continue if status is unfinished, prompt user 'yes' or 'no' whether user want to re upload again
						if(item) {
							if(item.status === 'inprogress') {
								// continue upload
								item.uploader.file = file;
								UploadQueue.queueItem(item.uploader);
							} else {
								alert('You already upload this item');
							}
						} else {
							// Make a new request to upload
							var newPartition = new Partition({
								videoId: model._id,
								originalFileName: file.name,
								filesize: file.size,
							});

							newPartition.$save(function(response) {
								console.log("the file is ", file);
								response.file = file;
								model.partitions.push(response);
							}, function(errorResponse) {
								alert('Something wrong with the upload, try again')
							});
						}

					});

					$scope.$apply();
				}
			};

			this.deletePartition = function(partition) {
				Partition.delete({ videoId: partition.videoId ,partitionId: partition._id });
			}

			processDragOverOrEnter = function(event) {
				if (event !== null) {
					event.stopPropagation();
					event.preventDefault();
				}
				event.dataTransfer.effectAllowed = 'copy';
				return false;
			};

			$element.bind('dragover', processDragOverOrEnter);
			$element.bind('dragenter', processDragOverOrEnter);
			$element.bind('drop', function(event) {
				var file, reader;
				if (event !== null) {
					event.preventDefault();
				}
				$scope.queue(event.dataTransfer.files);
				return false;
			});
		},
		templateUrl: '/modules/videos/directives/upload-dropzone.html'
	};
})
.directive('uploadList', function($timeout, UploadQueue, Partition) {
	return {
		require: ['^uploadDropzone'],
		restrict: 'E',
		scope: {
			partition: '=partition'
		},
		link: function(scope, elements, attrs, controllers) {
			var uploadDropzoneController = controllers[0];

			scope.deletePartition = function(partition) {
				if(partition) {
					elements.remove();
					uploadDropzoneController.deletePartition(partition);
				}
			}

	    scope.partition.settings = {
				file: scope.partition.file || null,
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
					UploadQueue.removeFromUploadQueue(scope.partition.uploader);
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
				scope.partition.uploader = bro_upload(scope.partition.settings);
				if(scope.partition.uploader.file) {
					UploadQueue.queueItem(scope.partition.uploader);
				}
				window.uploader.push(scope.partition);
			}
		},
		templateUrl: '/modules/videos/directives/upload-list.html'
	};
});
