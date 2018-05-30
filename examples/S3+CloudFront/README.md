# Deploy to S3 + CloudFront

A CloudFormation setup using S3 and CloudFront. The `index.html` and all assets are uploaded to an S3 bucket created by
the template, and served through a provisioned CloudFront distribution, using a custom domain name and SSL encryption.

The setup supports [`history`](https://www.emberjs.com/api/ember/3.1/classes/HistoryLocation)-location based routing by
suitable CLoudFront settings to serve `index.html` for non-existing content.

*Note: the domain name is not automatically setup. You have to add a `CNAME` record to your DNS pointing to the 
CloudFront domain name, given by the `CloudFrontDomainName` output!*

## Deployment plugins

Install these additional Ember CLI Deploy plugins:

* [`ember-cli-deploy-s3-index`](https://github.com/ember-cli-deploy/ember-cli-deploy-s3-index)
* [`ember-cli-deploy-s3-pack`](https://github.com/Gaurav0/ember-cli-deploy-s3-pack)
* [`ember-cli-deploy-cloudfront`](https://github.com/kpfefferle/ember-cli-deploy-cloudfront)

## CloudFormation template

[cfn.yaml](cfn.yaml)

## Example configuration

[deploy.js](deploy.js)

## Inputs

| Name            | Description                                                                               | Type      | Default |
|-----------------|-------------------------------------------------------------------------------------------|-----------|---------|
| `DomainName`    | Domain name of the CDN, e.g. www.example.com                                              | `string`  |         |
| `CFCertificate` | Existing ACM Certificate ARN for `DomainName`. Must be created in the `us-east-1` region! | `string`  |         |
| `ForceHttps`    | Force HTTPS by redirecting HTTP requests                                                  | `0` / `1` | 0       |


## Outputs

| Name                     | Description                                                                                                                                      |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `AssetsBucket`           | The name of the S3 bucket the app will be uploaded to                                                                                            |
| `CloudFrontDistribution` | The CloudFront distribution ID                                                                                                                   |
| `CloudFrontDomainName`   | The original domain name of the CloudFront  *Note: the `DomainName` input parameter will be used as a `CNAME`.  This is the primary domain name* |


