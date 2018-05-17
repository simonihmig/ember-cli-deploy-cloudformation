/*eslint-env node*/
'use strict';

const subject = require('../../index');
const assert  = require('../helpers/assert');

describe('Cloudformation plugin', function() {
  it('has a name', function() {
    let instance = subject.createDeployPlugin({
      name: 'cloudformation'
    });

    assert.equal(instance.name, 'cloudformation');
  });

  it('implements the correct hooks', function() {
    let plugin = subject.createDeployPlugin({
      name: 'cloudformation'
    });

    assert.isDefined(plugin.configure);
    assert.isFunction(plugin.configure);
  });
});
