# ember-cli-deploy-cloudformation

> An Ember CLI Deploy plugin to ....... (you could add a tag line for your plugin here)

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

## Ember CLI Deploy Hooks Implemented

For detailed information on what plugin hooks are and how they work, please refer to the [Plugin Documentation][1].

[TODO] You should add a list of the pipeline hooks that your plugin implements here, for example:

- `configure`
- `build`
- `upload`

## Configuration Options

For detailed information on how configuration of plugins works, please refer to the [Plugin Documentation][1].

[TODO] You should describe the config options your plugin accepts here, for example:

### someConfigProperty

[TODO] Some description of this config property should go here

*Default:* `'some sensible default could go here'`

## Prerequisites

The following properties are expected to be present on the deployment context object:

[TODO] You should describe which context properties your plugin depends on, for example:

- `distDir` (provided by [ember-cli-deploy-build][2])

## Tests

* yarn test

## Why `ember test` doesn't work

Since this is a node-only Ember CLI addon, we use mocha for testing and this package does not include many files and devDependencies which are part of Ember CLI's typical `ember test` processes.

[1]: http://ember-cli-deploy.com/plugins/ "Plugin Documentation"
[2]: https://github.com/ember-cli-deploy/ember-cli-deploy-build "ember-cli-deploy-build"
