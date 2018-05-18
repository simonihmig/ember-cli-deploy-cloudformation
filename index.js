/*eslint-env node*/
'use strict';

//const RSVP = require('rsvp');
const DeployPluginBase = require('ember-cli-deploy-plugin');
const CfnClient = require('./lib/cfn');

const optionKeys = [
  'accessKeyId',
  'secretAccessKey',
  'region',
  'templateBody',
  'templateUrl',
  'stackName'
];

module.exports = {
  name: 'ember-cli-deploy-cloudformation',

  createDeployPlugin: function(options) {
    let DeployPlugin = DeployPluginBase.extend({
      name: options.name,

      /*
       * Define any config validation here
       *
       * http://ember-cli-deploy.com/docs/v1.0.x/creating-a-plugin/#validating-plugin-config
       */

      defaultConfig: {
        cfnClient(context) {
          return context.cfnClient;
        },
        // awsCloudFormationClient(context) {
        //   return context.awsCloudFormationClient; // if you want to provide your own CloudFormation client to be used instead of one from aws-sdk
        // }
      },
      requiredConfig: [],

      /*
       * Implement any pipeline hooks here
       *
       * http://ember-cli-deploy.com/docs/v1.0.x/pipeline-hooks/
       */

      configure(context) {
        this.defaultConfig.stackName = `${context.project.name()}-${context.deployTarget}`;
        this._super.configure.apply(this, arguments);

        let templateBody = this.readConfig('templateBody');
        let templateUrl = this.readConfig('templateURL');

        if (!templateBody && !templateUrl) {
          let message = `Missing required config: either 'templateBody' or 'templateURL' is required`;
          this.log(message, { color: 'red' });
          throw new Error(message);
        }
      },

      setup() {
        let options = optionKeys
          .map((key) => ({ [key]: this.readConfig(key)}))
          .reduce((result, item) => Object.assign(result, item), {});

        this.cfnClient = this.readConfig('cfnClient') || new CfnClient(options);

        return this.cfnClient.validateTemplate()
          .catch(this._errorMessage.bind(this));
      },

      _errorMessage(error) {
        this.log(error, { color: 'red' });
        if (error && error.stack) {
          this.log(error.stack, { color: 'red' });
        }
        return Promise.reject(error);
      }

      //willDeploy(context) {
      //  return RSVP.resolve(); // Return a promise if you'd like the pipeline to wait until the hook has performed some function
      //},

      //willBuild(context) {},
      //build(context) {},
      //didBuild(context) {},

      //willPrepare(context) {},
      //prepare(context) {},
      //didPrepare(context) {},

      //willUpload(context) {},
      //upload(context) {},
      //didUpload(context) {},

      //willActivate(context) {},
      //activate(context) {},
      //didActivate(context) {},

      //fetchInitialRevisions(context) {},
      //fetchRevisions(context) {},

      //didDeploy(context) {},

      //teardown(context) {},
    });

    return new DeployPlugin();
  }
};
