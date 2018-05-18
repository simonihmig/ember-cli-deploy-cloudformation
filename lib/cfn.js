'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');

function hash2ArrayHash(hash, keyProperty = 'Key', valueProperty = 'Value') {
  return Object.keys(hash)
    .map(key => ({
      [keyProperty]: key,
      [valueProperty]: hash[key]
    }));
}

function ucFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

class CfnClient {

  constructor(options) {

    let awsOptions = {
      region: options.region,
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey
    };

    if (options.profile) {
      awsOptions.credentials = new AWS.SharedIniFileCredentials({ profile });
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
    return this.awsClient
      .createStack(this.awsOptions)
      .promise()
      .then(() => this.awsClient.waitFor('stackCreateComplete', { StackName: this.options.stackName }).promise());
  }

  updateStack() {
    return this.awsClient
      .updateStack(this.awsOptions)
      .promise()
      .then(() => this.awsClient.waitFor('stackUpdateComplete', { StackName: this.options.stackName }).promise())
      .catch(err => {
        if (!String(err).includes('No updates are to be performed')) {
          throw err;
        }
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
      .then((data) => {
        if (!data.Outputs) {
          throw new Error('No Outputs found in `describeStacks` data');
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

}

module.exports = CfnClient;
