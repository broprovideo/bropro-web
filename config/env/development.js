'use strict';

module.exports = {
	db: 'mongodb://localhost/mean-dev',
	app: {
		title: 'Your Video Editing HERO - BroProBroPro | Your Video Editing HERO | Development'
	},
	facebook: {
    clientID: process.env.FACEBOOK_ID || 'APP_ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
    clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
    callbackURL: '/api/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/linkedin/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID || 'APP_ID',
    clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/github/callback'
  },
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	},
	metaserver: process.env.METASERVER || 'http://go.bropro.video:3001',
	S3: {
		accessKey: process.env.S3_AWS_ACCESS_KEY || 'AKIAIIQMKQOPPKZKAMCA',
		secretKey: process.env.S3_AWS_SECRET_KEY || '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',
		bucket: process.env.S3_BUCKET || 'beta.bropro',
		region: process.env.S3_REGION || 'us-east-1'
	},
	uploaderOptions: {
		accessKey: process.env.UPLOADER_AWS_ACCESS_KEY || 'AKIAIIQMKQOPPKZKAMCA',
		secretKey: process.env.UPLOADER_AWS_SECRET_KEY || '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',
		bucket: process.env.UPLOADER_S3_BUCKET || 'beta.bropro',
		region: process.env.UPLOADER_REGION || 'us-east-1'
	}
};
