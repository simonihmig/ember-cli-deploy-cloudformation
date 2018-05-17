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

      defaultConfig: {
        meaningOfLife: 42 // Example default config. Remove this.
      },
      requiredConfig: ['isInNeedOfSleep'], // Example required config. Remove this;

      /*
       * Implement any pipeline hooks here
       *
       * http://ember-cli-deploy.com/docs/v1.0.x/pipeline-hooks/
       */

      //configure(context) {
      //  let configProp = this.readConfig('foo'); // this is how you access plugin config
      //},

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
