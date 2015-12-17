'use strict';

module.exports = {
    db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/mean',
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
    from: process.env.MAILER_FROM || 'dylan@gomomentum.marketing',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'dylan@gomomentum.marketing',
        pass: process.env.MAILER_PASSWORD || 'theclub01'
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
