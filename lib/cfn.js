'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');

function hash2ArrayHash(hash, keyProperty = 'Key', valueProperty = 'Value') {
  return Object.keys(hash)
    .map(key => {
      return hash[key] !== undefined ? {
        [keyProperty]: key,
        [valueProperty]: hash[key]
      } : undefined;
    })
    .filter(Boolean);
}

function ucFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

class CfnClient {

  constructor(options) {

    let awsOptions = {
      apiVersion: '2010-05-15',
      region: options.region,
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey
    };

    if (options.profile) {
      awsOptions.credentials = new AWS.SharedIniFileCredentials({ profile: options.profile });
    }

    let cfnOptions = Object.assign({}, options);
    delete cfnOptions.region;
    delete cfnOptions.accessKeyId;
    delete cfnOptions.secretAccessKey;
    delete cfnOptions.profile;

    this.setOptions(cfnOptions);
    this.awsClient = new AWS.CloudFormation(awsOptions);
  }

  validateTemplate() {
    let options = {};

    if (this.awsOptions.TemplateBody) {
      options.TemplateBody = this.awsOptions.TemplateBody
    } else {
      options.TemplateURL = this.awsOptions.templateURL;
    }

    return this.awsClient.validateTemplate(options).promise();
  }

  stackExists() {
    return this.awsClient
      .describeStacks({ StackName: this.options.stackName })
      .promise()
      .then(() => true)
      .catch((err) => {
        if (String(err).endsWith('does not exist')) {
          return false;
        }
        throw err;
      });
  }

  createStack() {
    this.log(`Creating new CloudFormation stack '${this.options.stackName}'...`, 'debug');
    return this.awsClient
      .createStack(this.awsOptions)
      .promise()
      .then(() => this.awsClient.waitFor('stackCreateComplete', { StackName: this.options.stackName }).promise())
      .then(() => this.log(`New CloudFormation stack '${this.options.stackName}' has been created!`));
  }

  updateStack() {
    this.log(`Updating CloudFormation stack '${this.options.stackName}'...`, 'debug');
    return this.awsClient
      .updateStack(this.awsOptions)
      .promise()
      .then(() => this.awsClient.waitFor('stackUpdateComplete', { StackName: this.options.stackName }).promise())
      .then(() => this.log(`CloudFormation stack '${this.options.stackName}' has been updated!`))
      .catch(err => {
        if (String(err).includes('No updates are to be performed')) {
          this.log(`No updates are to be performed to CloudFormation stack '${this.options.stackName}'`, 'debug');
          return;
        }
        throw err;
      });
  }

  createOrUpdateStack() {
    return this.stackExists()
      .then(result => {
        if (result === true) {
          return this.updateStack();
        }
        return this.createStack();
      })
  }

  fetchOutputs() {
    return this.awsClient
      .describeStacks({ StackName: this.options.stackName })
      .promise()
      .then((result) => {
        if (!result.Stacks || !result.Stacks[0]) {
          throw new Error('No stack data found from `describeStacks` call');
        }

        let data = result.Stacks[0];

        if (!data.Outputs) {
          return {};
        }

        return data.Outputs
          .map(item => ({ [item.OutputKey]: item.OutputValue }))
          .reduce((result, item) => Object.assign(result, item), {})
      });
  }

  setOptions(options) {
    this.options = options;

    this.awsOptions = Object.keys(options)
      .map(origKey => {
        let value = options[origKey];
        let key = ucFirst(origKey);

        if (value === undefined) {
          return;
        }

        switch (origKey) {
          case 'parameters':
            value = hash2ArrayHash(value, 'ParameterKey', 'ParameterValue');
            break;
          case 'tags':
            value = hash2ArrayHash(value);
            break;
          case 'templateBody':
            if (value.startsWith('file://')) {
              value = fs.readFileSync(value.slice(7), { encoding: 'utf8' })
            }
        }

        return { [key]: value };
      })
      .reduce((result, item) => Object.assign(result, item), {});
  }

  log(message, type = 'log') {
    if (this.logger) {
      if (typeof this.logger[type] !== 'function') {
        throw new Error(`Logger does not implement ${type} type`);
      }
      this.logger[type](message);
    }
  }

}

module.exports = CfnClient;
