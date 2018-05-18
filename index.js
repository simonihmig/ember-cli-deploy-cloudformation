/*eslint-env node*/
'use strict';

//const RSVP = require('rsvp');
const DeployPluginBase = require('ember-cli-deploy-plugin');
const CfnClient = require('./lib/cfn');

module.exports = {
  name: 'ember-cli-deploy-cloudformation',

  createDeployPlugin: function(options) {
    let DeployPlugin = DeployPluginBase.extend({
      name: options.name,

      defaultConfig: {},
      requiredConfig: [],

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
        let options = Object.keys(this.pluginConfig)
          .map((key) => ({ [key]: this.readConfig(key)}))
          .reduce((result, item) => Object.assign(result, item), {});

        this.cfnClient = this.readConfig('cfnClient') || new CfnClient(options);

        return this.cfnClient.validateTemplate()
          .catch(this._errorMessage.bind(this));
      },

      prepare(context) {
        return this.cfnClient.createOrUpdateStack()
          .then(() => this.cfnClient.fetchOutputs())
          .then(outputs => {
            context.cloudformation = {
              outputs
            };
          })
          .catch(this._errorMessage.bind(this));
      },

      _errorMessage(error) {
        this.log(error, { color: 'red' });
        if (error && error.stack) {
          this.log(error.stack, { color: 'red' });
        }
        return Promise.reject(error);
      }
    });

    return new DeployPlugin();
  }
};
