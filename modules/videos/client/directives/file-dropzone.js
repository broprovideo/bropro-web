'use strict';

angular.module('videos').directive('fileDropzone', function($timeout) {
	return {
		require: [],
		restrict: 'A',
		scope: {
			onFileDrop: '='
		},
		link: function(scope, element, attrs, controllers) {
			console.log("File dropzone intialized");
			var checkSize, isTypeValid, processDragOverOrEnter, validMimeTypes;
			processDragOverOrEnter = function(event) {
				if (event != null) {
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
				console.log("Video dropped!");
				var file, name, reader, size, type;
				if (event != null) {
					event.preventDefault();
				}
				reader = new FileReader();
				reader.onload = function(evt) {
					return scope.$apply();
				};
				scope.onFileDrop(event.dataTransfer.files);
				file = event.dataTransfer.files[0];
				name = file.name;
				type = file.type;
				size = file.size;
				reader.readAsDataURL(file);
				return false;
			});

		},
	}
});
