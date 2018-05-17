/*eslint-env node*/
'use strict';

const subject = require('../../index');
const { expect } = require('chai');

describe('Cloudformation | configure hook', function() {
  let mockUi;

  beforeEach(function() {
    mockUi = {
      verbose: true,
      messages: [],
      write: function() { },
      writeLine: function(message) {
        this.messages.push(message);
      }
    };
  });

  describe('required config', function() {
    it('warns about missing config props', function() {
      let instance = subject.createDeployPlugin({
        name: 'cloudformation'
      });

      let context = {
        ui: mockUi,
        config: {
          'cloudformation': {}
        },
        project: {
          name() {
            return 'myapp'
          }
        }
      };

      instance.beforeHook(context);

      let msg = `Missing required config: either 'templateBody' or 'templateUrl' is required`;

      expect(() => instance.configure(context)).to.throw(msg);
      expect(mockUi.messages.pop()).to.include(msg);
    });
  });

  describe('default config', function() {
    it('provides default stackName', function() {
      let instance = subject.createDeployPlugin({
        name: 'cloudformation'
      });

      let context = {
        ui: mockUi,
        config: {
          cloudformation: {
            templateBody: 'dummy'
          }
        },
        project: {
          name() {
            return 'myapp'
          }
        },
        deployTarget: 'production'
      };

      instance.beforeHook(context);
      instance.configure(context);

      expect(instance.readConfig('stackName')).to.equal('myapp-production');
    });
  });
});
