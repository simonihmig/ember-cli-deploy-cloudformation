/*eslint-env node*/
'use strict';

const subject = require('../../index');
const { expect } = require('chai');

describe('Cloudformation plugin', function() {
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
});
