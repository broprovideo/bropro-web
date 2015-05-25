'use strict';

angular.module('videos').factory('UploadQueue', [
	function() {

		var that = {};
		that.uploadQueue = [];
		that.pendingQueue = [];

		that.queueItem = function(uploadItem) {
			that.pendingQueue.push(uploadItem);
		};

		that.removeFromUploadQueue = function(uploadItem) {
			var itemIndex = that.uploadQueue.indexOf(uploadItem);
			that.uploadQueue[itemIndex] = undefined;
		};

		that.startUploadQueue = function() {
			console.log('start upload executed!');
			if(that.uploadQueue.length < 5) {
				var uploadItem = that.uploadQueue.shift();
				if(uploadItem && uploadItem.file) {
					uploadItem.start();
					that.uploadQueue.push(uploadItem);
				}
			}
		};

		setInterval(that.startUploadQueue, 1000);

		return that;
	}
]);
