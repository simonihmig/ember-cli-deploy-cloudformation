/*eslint-env node*/
'use strict';

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const sinon = require('sinon');
const chaiSinon = require('sinon-chai');
const CfnClient = require('../../lib/cfn');
const AWS = require('aws-sdk');
const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(chaiSinon);

const options = {
  accessKeyId: 'abc',
  secretAccessKey: 'def',
  region: 'us-east-1',
  stackName: 'myStack',
  templateBody: 'template',
  parameters: {
    key1: 'val1',
    key2: 'val2'
  },
  capabilities: ['CAPABILITY_IAM'],
  resourceTypes: ['AWS::*'],
  roleArn: 'ROLE',
  stackPolicyBody: 'body',
  notificationARNs: 'arn',
  tags: {
    key1: 'val1',
    key2: 'val2'
  },
  timeoutInMinutes: 10,
  disableRollback: true,
  rollbackConfiguration: {
    MonitoringTimeInMinutes: 10
  }
};

const expectedOptions = {
  StackName: 'myStack',
  TemplateBody: 'template',
  Parameters: [
    {
      ParameterKey: 'key1',
      ParameterValue: 'val1'
    },
    {
      ParameterKey: 'key2',
      ParameterValue: 'val2'
    }
  ],
  Capabilities: ['CAPABILITY_IAM'],
  ResourceTypes: ['AWS::*'],
  RoleArn: 'ROLE',
  StackPolicyBody: 'body',
  NotificationARNs: 'arn',
  Tags: [
    {
      Key: 'key1',
      Value: 'val1'
    },
    {
      Key: 'key2',
      Value: 'val2'
    }
  ],
  TimeoutInMinutes: 10,
  DisableRollback: true,
  RollbackConfiguration: {
    MonitoringTimeInMinutes: 10
  }
};

const describeData = {
  StackName: 'myStack',
  StackStatus: 'CREATE_COMPLETE',
  Outputs: [
    {
      OutputKey: 'AssetsBucket',
      OutputValue: 'abc-123456789'
    },
    {
      OutputKey: 'CloudFrontDistribution',
      OutputValue: 'EFG123456789'
    }
  ]
};

describe('Cloudformation client', function() {
  let client;

  beforeEach(function() {
    client = new CfnClient(options);
    sinon.stub(client.awsClient, 'createStack').returns({
      promise: sinon.fake.resolves()
    });
    sinon.stub(client.awsClient, 'updateStack').returns({
      promise: sinon.fake.resolves()
    });
    sinon.stub(client.awsClient, 'waitFor').returns({
      promise: sinon.fake.resolves()
    });
    sinon.stub(client.awsClient, 'describeStacks').returns({
      promise: sinon.fake.resolves(describeData)
    });
  });

  afterEach(function() {
    sinon.restore();
  });

  it('passes constructor args to AWS.CloudFormation', function() {
    let constructor = sinon.fake();
    sinon.replace(AWS, 'CloudFormation', constructor);

    new CfnClient({
      foo: 'bar',
      accessKeyId: 'abc',
      secretAccessKey: 'def',
      region: 'us-east-1'
    });

    expect(constructor).to.always.have.been.calledWithNew;
    expect(constructor).to.have.been.calledWith({
      accessKeyId: 'abc',
      secretAccessKey: 'def',
      region: 'us-east-1'
    });
  });

  function checkCreateStack(callFn) {
    it('it calls createStack with adjusted options', function() {
      return expect(callFn()).to.be.fulfilled
        .then(() => expect(client.awsClient.createStack).to.have.been.calledWith(expectedOptions));
    });

    it('it waits for stackCreateComplete', function() {
      return expect(callFn()).to.be.fulfilled
        .then(() => expect(client.awsClient.waitFor).to.have.been.calledWith('stackCreateComplete', { StackName: 'myStack' }));
    });

    it('rejects when createStack fails', function() {
      client.awsClient.createStack.returns({
        promise: sinon.fake.rejects()
      });

      return expect(callFn()).to.be.rejected;
    });
  }

  function checkUpdateStack(callFn) {
    it('it calls updateStack with adjusted options', function() {
      return expect(callFn()).to.be.fulfilled
        .then(() => expect(client.awsClient.updateStack).to.have.been.calledWith(expectedOptions));
    });

    it('it waits for stackUpdateComplete', function() {
      return expect(callFn()).to.be.fulfilled
        .then(() => expect(client.awsClient.waitFor).to.have.been.calledWith('stackUpdateComplete', { StackName: 'myStack' }));
    });

    it('rejects when updateStack fails', function() {
      client.awsClient.updateStack.returns({
        promise: sinon.fake.rejects()
      });

      return expect(callFn()).to.be.rejected;
    });

    it('ignores unchanged stack', function() {
      client.awsClient.updateStack.returns({
        promise: sinon.fake.rejects('No updates are to be performed')
      });

      return expect(callFn()).to.be.fulfilled
        .then(() => expect(client.awsClient.waitFor).to.not.have.been.called);
    });
  }

  describe('createStack', function() {
    checkCreateStack(() => client.createStack());
  });

  describe('updateStack', function() {
    checkUpdateStack(() => client.updateStack());
  });

  describe('stackExists', function() {
    it('returns true when stack exists', function() {
      return expect(client.stackExists()).to.eventually.be.true;
    });

    it('returns false when stack does not exists', function() {
      client.awsClient.describeStacks.returns({
        promise: sinon.fake.rejects('Stack with id myStack does not exist')
      });
      return expect(client.stackExists()).to.eventually.be.false;
    });
  });

  describe('createOrUpdateStack', function() {
    describe('stack does not exist', function() {
      beforeEach(function() {
        sinon.stub(client, 'stackExists').resolves(false);
      });

      checkCreateStack(() => client.createOrUpdateStack());
    });

    describe('stack exists', function() {
      beforeEach(function() {
        sinon.stub(client, 'stackExists').resolves(true);
      });

      checkUpdateStack(() => client.createOrUpdateStack());
    });
  });

  describe('fetchOutputs', function() {
    it('returns adjusted output hash', function() {
      return expect(client.fetchOutputs()).to.eventually.deep.equal({
        AssetsBucket: 'abc-123456789',
        CloudFrontDistribution: 'EFG123456789'
      });
    });
  });

});
