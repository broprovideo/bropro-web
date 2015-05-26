'use strict';

var indexOfPartition = function(o, arr) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].file.name === o.file.name) {
				return i;
		}
	}
	return -1;
};

angular.module('videos').factory('UploadQueue', [
	function() {

		var that = {};
		that.uploadQueue = [];
		that.pendingQueue = [];

		that.queueItem = function(uploadItem) {
			that.pendingQueue.push(uploadItem);
		};

		that.removeFromUploadQueue = function(uploadItem) {
			var itemIndex = indexOfPartition(uploadItem, that.uploadQueue);
			if(itemIndex >= 0) {
				that.uploadQueue.splice(itemIndex);
			}
		};

		that.startUploadQueue = function() {
			if(that.uploadQueue.length < 5) {
				var uploadItem = that.pendingQueue.shift();
				if(uploadItem && uploadItem.file) {
					uploadItem.start();
					console.log('Upload started for '+uploadItem.file.name);
					that.uploadQueue.push(uploadItem);
				}
			}
		};

		setInterval(that.startUploadQueue, 1000);

		return that;
	}
]);
