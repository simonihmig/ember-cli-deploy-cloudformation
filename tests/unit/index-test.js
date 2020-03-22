/*eslint-env node*/
'use strict';

const CfnClient = require('../../lib/cfn');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const chaiSinon = require('sinon-chai');
const subject = require('../../index');
const sinon = require('sinon');
const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(chaiSinon);

const expectedOutputs = {
  AssetsBucket: 'abc-123456789',
  CloudFrontDistribution: 'EFG123456789'
};

const pluginOptions = {
  templateBody: 'dummy',
  region: 'eu-central-1'
};

describe('Cloudformation plugin', function() {
  let mockUi;
  let instance;
  let cfnClient;
  let context;

  beforeEach(function() {
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
        cloudformation: Object.assign({}, pluginOptions)
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

    cfnClient = new CfnClient(context.config.cloudformation);
    context.config.cloudformation.cfnClient = cfnClient;
    sinon.stub(cfnClient, 'validateTemplate').resolves();
    sinon.stub(cfnClient, 'createOrUpdateStack').resolves();
    sinon.stub(cfnClient, 'fetchOutputs').resolves(expectedOutputs);
  });

  afterEach(function() {
    sinon.restore();
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
    it('resolves', function() {
      instance.beforeHook(context);
      return expect(instance.setup(context)).to.be.fulfilled;
    });

    it('errors on invalid template', async function() {
      let msg = 'invalid template';
      cfnClient.validateTemplate.rejects(msg);

      instance.beforeHook(context);

      await expect(instance.setup(context)).to.be.rejected;
      expect(mockUi.messages.pop()).to.include(msg);
    });

  });

  describe('prepare', function() {
    it('creates or updates stack', async function() {
      instance.beforeHook(context);
      instance.setup(context);
      await expect(instance.prepare(context)).to.be.fulfilled;
      expect(cfnClient.createOrUpdateStack).to.have.been.calledOnce;
    });

    it('adds outputs to context', async function() {
      instance.beforeHook(context);
      instance.setup(context);
      await expect(instance.prepare(context)).to.be.fulfilled;
      expect(context.cloudformation).to.exist;
      expect(context.cloudformation).to.have.property('outputs', expectedOutputs);
    });
  });

});
