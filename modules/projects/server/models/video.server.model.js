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
var VideoSchema = new Schema({
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
	fileSize: {
		type: Number,
		index: true
	},
	lastModified: {
		type: Number,
		index: true
	},
	originalFileName: {
		type: String,
		default: '',
		trim: true
	},
	chunks: [],
	project: {
		type: Schema.ObjectId,
		ref: 'Project'
	}
});

mongoose.model('Video', VideoSchema);
