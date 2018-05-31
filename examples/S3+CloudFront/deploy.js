/* eslint-env node */
'use strict';

module.exports = function(deployTarget) {
  let ENV = {
    build: {
      environment: 'production'
    },
    pipeline: {
      // This setting runs the ember-cli-deploy activation hooks on every deploy
      // which is necessary in order to run ember-cli-deploy-cloudfront.
      // To disable CloudFront invalidation, remove this setting or change it to `false`.
      // To disable ember-cli-deploy-cloudfront for only a particular environment, add
      // `ENV.pipeline.activateOnDeploy = false` to an environment conditional below.
      activateOnDeploy: true
    },
    cloudformation: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,             // SET THE ENV VAR
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,     // SET THE ENV VAR
      region: 'us-east-1',
      stackName: `${require('../package.json').name}-${deployTarget}`,
      templateBody: 'file://cfn.yaml',
      capabilities: ['CAPABILITY_IAM'],
      parameters: {
        DomainName: process.env.CFN_DOMAINNAME,               // SET THE ENV VAR OR REPLACE!
        CFCertificate: process.env.CFN_CFCERTIFICATE          // SET THE ENV VAR OR REPLACE!
      }
    },
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket(context) {
        return context.cloudformation.outputs.AssetsBucket;
      },
      region: 'us-east-1'
    },
    's3-index': {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket(context) {
        return context.cloudformation.outputs.AssetsBucket;
      },
      region: 'us-east-1',
      filePattern: 'index.html'
    },
    cloudfront: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      distribution(context) {
        return context.cloudformation.outputs.CloudFrontDistribution;
      }
    }
  };

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
