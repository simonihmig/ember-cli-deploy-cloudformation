/*eslint-env node*/
'use strict';

//const RSVP = require('rsvp');
const DeployPluginBase = require('ember-cli-deploy-plugin');

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

      defaultConfig: {},
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
        let templateUrl = this.readConfig('templateUrl');

        if (!templateBody && !templateUrl) {
          let message = `Missing required config: either 'templateBody' or 'templateUrl' is required`;
          this.log(message, { color: 'red' });
          throw new Error(message);
        }
      },

      //setup(context) {
      //  // Return an object with values you'd like merged in to the context to be accessed by other pipeline hooks and plugins
      //  return {
      //    someProp: 'someValue'
      //  };
      //},

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
