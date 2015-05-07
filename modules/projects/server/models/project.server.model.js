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
var ProjectSchema = new Schema({
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
	videos: [Schema.Types.ObjectId],
	description: {
		type: String,
		default: '',
		trim: true
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Project', ProjectSchema);
