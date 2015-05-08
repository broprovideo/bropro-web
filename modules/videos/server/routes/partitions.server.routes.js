'use strict';

/**
 * Module dependencies.
 */
var partitionPolicy = require('../policies/partitions.server.policy'),
	partition = require('../controllers/partitions.server.controller');

module.exports = function(app) {
	// Paritition collection routes
	app.route('/api/partitions').all(partitionPolicy.isAllowed)
		.get(partition.list)
		.post(partition.create);

	// Mule-uploader routes
	app.route('/api/partitions/signing_key/')
		.get(partition.getS3sign);
	app.route('/api/partitions/chunk_loaded/')
		.get(partition.s3chunkLoaded);

	// Single partition routes
	app.route('/api/partitions/:partitionId').all(partitionPolicy.isAllowed)
		.get(partition.read)
		.put(partition.update)
		.delete(partition.delete);

	// Finish by binding the partition middleware
	app.param('partitionId', partition.partitionByID);
};
