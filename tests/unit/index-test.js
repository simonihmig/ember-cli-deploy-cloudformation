/*eslint-env node*/
'use strict';

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const subject = require('../../index');
const { expect } = chai;

chai.use(chaiAsPromised);

describe('Cloudformation plugin', function() {
  let mockUi;
  let instance;
  let cfnClient;
  let context;

  beforeEach(function() {
    cfnClient = {
      validateTemplate() {
        return Promise.resolve();
      }
    };
    mockUi = {
      verbose: true,
      messages: [],
      write() {
      },
      writeLine(message) {
        this.messages.push(message);
      }
    };

    context = {
      ui: mockUi,
      config: {
        cloudformation: {
          templateBody: 'dummy',
          region: 'eu-central-1',
          cfnClient
        }
      },
      project: {
        name() {
          return 'myapp'
        }
      },
      deployTarget: 'production'
    };

    instance = subject.createDeployPlugin({
      name: 'cloudformation'
    });
  });

  it('has a name', function() {
    let instance = subject.createDeployPlugin({
      name: 'cloudformation'
    });

    expect(instance.name).to.equal('cloudformation');
  });

  it('implements the correct hooks', function() {
    let plugin = subject.createDeployPlugin({
      name: 'cloudformation'
    });

    expect(plugin.configure).to.be.a.function;
    expect(plugin.prepare).to.be.a.function;
  });

  describe('configure', function() {
    describe('required config', function() {
      it('errors on missing config props', function() {
        delete context.config.cloudformation.templateBody;
        instance.beforeHook(context);

        let msg = `Missing required config: either 'templateBody' or 'templateURL' is required`;

        expect(() => instance.configure(context)).to.throw(msg);
        expect(mockUi.messages.pop()).to.include(msg);
      });
    });

    describe('default config', function() {
      it('provides default stackName', function() {
        instance.beforeHook(context);
        instance.configure(context);

        expect(instance.readConfig('stackName')).to.equal('myapp-production');
      });
    });
  });

  describe('setup', function() {
    it('errors on invalid template', function() {
      let msg = 'invalid template';
      cfnClient.validateTemplate = () => Promise.reject(msg);

      instance.beforeHook(context);

      return expect(instance.setup(context)).to.be.rejected
        .then(() => expect(mockUi.messages.pop()).to.include(msg));
    });

  });

});
