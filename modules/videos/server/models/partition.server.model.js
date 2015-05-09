'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	shortid = require('shortid'),
	Schema = mongoose.Schema;

/**
 * Article Schema
 */
var PartitionSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	key: {
		type: String,
		default: shortid.generate(),
		index: true
	},
	backupKey: {
		type: String,
		default: shortid.generate(),
		index: true
	},
	filesize: {
		type: Number,
		index: true
	},
	lastModified: {
		type: Number,
		index: true
	},
	uploadId: {
		type: String,
		default: '',
		trim: true
	},
	originalFileName: {
		type: String,
		default: '',
		trim: true
	},
	chunks: [Number],
	totalChunk: {
		type: Number,
		default: 0
	},
	resultPath: {
		type: String,
		default: ''
	},
	status: {
		// Status can be either 'inprogress' or 'completed'
		type: String,
		default: 'inprogress',
		index: true
	},
	videoId: {
		type: String,
		index: true
	}
});

mongoose.model('Partition', PartitionSchema);
