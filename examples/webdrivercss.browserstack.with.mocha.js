'use strict';

// Node deps
var assert = require('assert');

// NPM packages
var webdriverio = require('webdriverio');
var webdrivercss = require('webdrivercss');

// All configuration goes here, to allow easier boilerplating.
var options = {
  browser: {
    'browserstack.debug': 'true',
    'browserstack.local': 'true',
    os: 'Windows',
    os_version: '7',
    browser: 'ie',
    browser_version: '9.0'
  },
  test: {
    title: 'Body_win7-ie9',
    name: 'body',
    url: 'http://localhost:3000/my/test/url', // this needs to be a real URL
    selector: 'body',
  },
  webdrivercss: {
    screenshotRoot: 'visual/reference',
    failedComparisonsRoot: 'visual/failed',
    misMatchTolerance: 0.05,
    screenWidth: [1024]
  }
};

// Get your key here: https://www.browserstack.com/accounts/automate
//
// Script assumes your BrowserStack creds are listed in JSON somewhere in your
// system. Convenient if you want to avoid storing keys in VCS. If storing in
// VCS is ok, just assign an object literal to config:
//
// var config = {
//   "browserstack": {
//     "user": "MY_USER",
//     "key": "MY_KEY"
//   }
// }
var config = require('./browserstack.json');

// Configure webdriverio
var client = webdriverio.remote({
  desiredCapabilities: options.browser,
  host: 'hub.browserstack.com',
  port: 80,
  user: config.browserstack.user,
  key: config.browserstack.key
});

// Run the test
describe('Win7 / IE9: My Component @ 1024', function () {
  this.timeout(600000);

  // If multiple tests are run by mocha, use its setup function to initialize
  // webdriverio and webdrivercss. Otherwise, BrowserStack connections might
  // timeout while you wait for the first few tests to run.
  before(function(){
    // Initialize webdriverio
    client.init();
    // Initialize webdrivercss
    webdrivercss.init(client, options.webdrivercss);
  });

  it('should look the same', function (done) {
    client
      .url(options.test.url)
      .webdrivercss(options.test.title, {
        name: options.test.name,
        elem: options.test.selector
      }, function(err, res) {
        assert.strictEqual(res[options.test.name][0].isWithinMisMatchTolerance, true);
      })
      .end()
      .call(done);
  });
});
