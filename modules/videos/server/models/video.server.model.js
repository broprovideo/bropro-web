'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	shortid = require('shortid'),
	Schema = mongoose.Schema;

/**
 * Video Schema
 */
var VideoSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	id: {
		type: String,
		default: shortid.generate(),
		index: true
	},
	title: {
		type: String,
		default: '',
		trim: true
	},
	status: {
		type: String,
		default: 'unsubmited',
		trim: true
	},
	s3path: {
		type: String,
		trim: true
	},
	submitDate: {
		type: Date,
		default: ''
	},
	publicLinks: {
		type: String,
		default: ''
	},
	editor: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	partitions: [{
		type: Schema.Types.ObjectId,
		ref: 'Partition'
	}],
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Video', VideoSchema);
