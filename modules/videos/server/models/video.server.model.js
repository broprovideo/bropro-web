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
