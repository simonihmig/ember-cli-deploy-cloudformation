# ember-cli-deploy-cloudformation

[![Build Status](https://github.com/kaliber5/ember-cli-deploy-cloudformation/workflows/CI/badge.svg)](https://github.com/kaliber5/ember-cli-deploy-cloudformation/actions)
[![Ember Observer Score](https://emberobserver.com/badges/ember-cli-deploy-cloudformation.svg)](https://emberobserver.com/addons/ember-cli-deploy-cloudformation)
[![npm version](https://badge.fury.io/js/ember-cli-deploy-cloudformation.svg)](https://badge.fury.io/js/ember-cli-deploy-cloudformation)

> An Ember CLI Deploy plugin to create/update an AWS CloudFormation stack before deploying to it

## Introduction

### What is CloudFormation?

[AWS CloudFormation][9] is Amazon's implementation of [infrastructure as code][6], which lets you create, update, provision
and delete stacks of AWS resources (e.g. EC2 instances, S3 buckets, CloudFront distributions etc.), described by a single 
configuration file.

For details on how CloudFormation works and how to write a template file, please visit the official
[CloudFormation Documentation][7]. Also check the [Examples section](#examples) for some example configurations for
common Ember deployment scenarios.

### What does this plugin do?

This is an Ember CLI addon that adds a plugin to the [Ember CLI Deploy][8] pipeline to create or update a CloudFormation
stack as part of the Ember CLI Deploy pipeline. It does not actually deploy any artefacts itself, this is where any of
the existing plugins that work with AWS resources come into play. Here are some that should work just fine:  

* [`ember-cli-deploy-s3`](https://github.com/ember-cli-deploy/ember-cli-deploy-s3)
* [`ember-cli-deploy-s3-index`](https://github.com/ember-cli-deploy/ember-cli-deploy-s3-index)
* [`ember-cli-deploy-s3-pack`](https://github.com/Gaurav0/ember-cli-deploy-s3-pack)
* [`ember-cli-deploy-cloudfront`](https://github.com/kpfefferle/ember-cli-deploy-cloudfront)
* [`ember-cli-deploy-elastic-beanstalk`](https://github.com/tomdale/ember-cli-deploy-elastic-beanstalk)
* [`ember-cli-deploy-fastboot-app-server-aws`](https://github.com/ember-cli-deploy/ember-cli-deploy-fastboot-app-server-aws)

This allows you to create the AWS resources and deploy your app to them in one single `ember deploy` command. 
For example you could easily deploy a feature branch to a new staging environment just for this feature and delete it 
afterwards, without any manual setup work.

### Why not use the AWS CLI directly?

The AWS CLI allows you to interact with CloudFormation, but suffers from a few caveats when integrating it into a
CI/CD pipeline:

* on the first run of the pipeline you need to create the stack, while you need to update it for all following
deployments.
* an update run without any changes to the stack is treated as an error by the CLI.
* there is no easy way to pass the outputs of the template (e.g. the name of a created S3 bucket) to any following
deployment steps.

## Installation

Run the following command in your terminal:

```bash
ember install ember-cli-deploy-cloudformation
```

## Examples

Ember is about shared solutions to common problems. And this applies here as well. Instead of figuring all the details
of a useful CloudFormation stack, this section will feature a few examples to get you going quickly:

* [S3 + CloudFront](examples/S3+CloudFront)
With a custom domain name (self hosted) and SSL

*This section is still a work in progess. If you have some templates you can share, please submit a PR so others can
benefit from your experience as well!*

## Configuration 

The configuration of this plugin takes place in three steps:

### 1. Create a CloudFormation template

Create a CloudFormation template, that defines all the AWS resources in your stack. Consult the 
[CloudFormation documentation][3] for more information.

Usually you will want to put this file under version control, so you can create it in your app's root folder as e.g.
`cfn.yaml`, `git add cfn-yaml`, and reference it in the plugin configuration as 
[`templateBody: 'file://cfn.yaml`](#templateBody).

### 2. Configure the plugin

Add the required configuration to your `config/deploy.js`.

See [Configuration Options](#configuration-options) below for all available configuration options. 
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

A CloudFormation template let's you define so called "Outputs". These are commonly values, which were not available before 
creating the stack. So for example these could be some resource properties, like the name of an S3 bucket created by 
CloudFormation or the URL of a CloudFront distribution. 

Some of these you will have to pass to other Ember CLI Deploy plugins, so they can actually deploy your app to the
infrastructure that CloudFormation has created for you. A common example would be to pass the S3 bucket to 
`ember-cli-deploy-s3`.

This plugin will write all outputs of the processed template to the [Ember CLI Deploy context][4], at the path
`cloudformation.outputs` as simple hash with the name of the output as the key. As Ember CLI Deploy allow you to 
configure plugins not only with static values, but also with functions that receive the context, you can easily
pass the outputs to any other plugin. Here the afore-mentioned S3 plugin will receive the name of the bucket, that was
defined in the CloudFormation template output as `AssetsBucket`:

```js
{
  cloudformation: {
    ...
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket(context) {
      return context.cloudformation.outputs.AssetsBucket;
    },
    region: 'eu-central-1'
  }
}
```

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
properties, specify them as normal JavaScript hashes (e.g. `tags: { key: 'value' }`) instead of the original AWS syntax! 

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


[1]: http://ember-cli-deploy.com/plugins/ "Plugin Documentation"
[2]: https://aws.amazon.com/documentation/cloudformation/ "AWS CloudFormation Documentation"
[3]: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html#createStack-property "AWS parameters"
[4]: http://ember-cli-deploy.com/docs/v1.0.x/the-deployment-context/ "Ember CLI Deploy context"
[5]: https://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Setting_AWS_Credentials "Setting AWS Credentials"
[6]: https://en.wikipedia.org/wiki/Infrastructure_as_Code
[7]: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html
[8]: http://ember-cli-deploy.com/
[9]: https://aws.amazon.com/cloudformation/
