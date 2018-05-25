# ember-cli-deploy-cloudformation

> An Ember CLI Deploy plugin to create/update an AWS CloudFormation stack before deploying to it

[TODO] You could write a short summary of your plugin here

## What is an Ember CLI Deploy plugin?

A plugin is an addon that can be executed as a part of the Ember CLI Deploy pipeline. A plugin will implement one or more of the Ember CLI Deploy's pipeline hooks.

For more information on what plugins are and how they work, please refer to the [Plugin Documentation][1].

## Quick Start

- Install this plugin

```bash
$ ember install ember-cli-deploy-cloudformation
```

[TODO] You could add some sensible default config examples needed to quickly run your plugin

- Run the pipeline

```bash
$ ember deploy
```

## Installation
Run the following command in your terminal:

```bash
ember install ember-cli-deploy-cloudformation
```

## Configuration 

The configurations of this plugin take place in three steps:

### 1. Create a CloudFormation template

Create a CloudFormation template, that defines all the AWS resources in your stack. Consult the 
[CloudFormation documentation][3] for more information.

Usually you will want to put this file under version control, so you can create it in your app's root folder as e.g.
`cfn.yaml`, `git add cfn-yaml`, and reference it in the plugin configuration as 
[`templateBody: 'file://cfn.yaml`](#templateBody).

### 2. Configure the plugin

Add the required configuration to your `config/deploy.js`.

See [Configuration Options](#Configuration Options) below for all available configuration options. 
For detailed information on how configuration of plugins works, please refer to the [Plugin Documentation][1].

#### Example

Here is an example of a configuration. It uses environment variables to inject all parameters that are variable:

```js
{
  cloudformation: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'eu-central-1',
    templateBody: 'file://cfn.yaml',
    capabilities: ['CAPABILITY_IAM'],
    parameters: {
      DomainName: process.env.CFN_DOMAINNAME,
      Certificate: process.env.CFN_CERTIFICATE,
      HostedZoneId: process.env.CFN_HOSTEDZONEID
    }
  }
}
```

### 3. Pipe outputs to other plugins

[TODO]

### Configuration Options

#### accessKeyId

The AWS access key for the user that has the ability to work with CloudFormation. If this is left undefined,
the normal [AWS SDK credential resolution][5] will take place.

*Default:* `undefined`

#### secretAccessKey

The AWS secret for the user that has the ability to work with CloudFormation. This must be defined when `accessKeyId` is defined.

*Default:* `undefined`

#### profile

The AWS profile as definied in `~/.aws/credentials`. If this is left undefined,
the normal [AWS SDK credential resolution][5] will take place.

*Default:* `undefined`

#### region

The region to create the CloudFormation stack in.

*Default:* `undefined`

<hr>

Moreover all parameters supported by the AWS CloudFormation SDK will be passed when creating/updating the stack. See the
[AWS SDK docs][3] for a complete reference.

> Note: the plugin will let you write parameters in the more usual camelcase style, and map them to the pascal case 
style that AWS expects. So instead of writing `StackName`, you can use `stackName`. Also for the `tags` and `parameters`
properties, specify them as normal JavaScript hashes (e.g. `tags: { key: 'value' }`) instead of the unusual AWS syntax! 

Here is a list of the commonly used CloudFormation parameters:

#### stackName

The name of the CLoudFormation stack.

*Default:* `<appName>-<deployTarget>`, e.g. `myApp-production`

#### templateBody

The CloudFormation template body as a string (JSON or YAML). Instead of inlining your template, the `file://` protocol 
is also supported to reference a template file on disk, e.g. `file://path/to/cfn.yaml` (relative to your app's root folder)

Either `templateBody` or `templateURL` is **required**!

*Default:* `undefined`

#### templateURL

The location of a CloudFormation template (JSON or YAML). The URL must point to a template that is located in an Amazon S3 bucket.

Either `templateBody` or `templateURL` is **required**!

*Default:* `undefined`

#### capabilities

An array of required capabilites, e.g. `['CAPABILITY_IAM']` for working with IAM roles, user, policies etc.

*Default:* `undefined`

#### parameters

A hash of input parameters as expected by your CloudFormation template. 

*Note: specify them as normal JavaScript hashes (e.g. `parameters: { name: 'value' }`) instead of the unusual AWS syntax!*

```js
parameters: {
  Domain: 'example.com'
}
```

*Default:* `undefined`

## Tests

* yarn test

## Why `ember test` doesn't work

Since this is a node-only Ember CLI addon, we use mocha for testing and this package does not include many files and devDependencies which are part of Ember CLI's typical `ember test` processes.

[1]: http://ember-cli-deploy.com/plugins/ "Plugin Documentation"
[2]: https://aws.amazon.com/documentation/cloudformation/ "AWS CloudFormation Documentation"
[3]: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html#createStack-property "AWS parameters"
[5]: https://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Setting_AWS_Credentials "Setting AWS Credentials"