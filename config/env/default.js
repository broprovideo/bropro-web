'use strict';

module.exports = {
	app: {
		title: 'Your Video Editing HERO - BroProBroPro | Your Video Editing HERO',
		description: 'Your Video Editing HERO',
		keywords: 'gopro, selfiestick',
		googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions'
};
