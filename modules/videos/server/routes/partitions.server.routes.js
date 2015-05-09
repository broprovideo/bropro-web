'use strict';

/**
 * Module dependencies.
 */
var partitionPolicy = require('../policies/partitions.server.policy'),
	partition = require('../controllers/partitions.server.controller');

module.exports = function(app) {
	
	// Mule-uploader routes
	app.route('/api/partitions/signing_key/')
		.get(partition.getS3sign);
	app.route('/api/partitions/chunk_loaded/')
		.get(partition.s3chunkLoaded);
};
