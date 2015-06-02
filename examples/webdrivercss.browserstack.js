'use strict';

// NPM packages
var webdriverio = require('webdriverio');
var webdrivercss = require('webdrivercss');

// All options go here, to allow easier boilerplating.
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
// Script assumes your BrowserStack creds are listed in the JSON file.
// Convenient if you want to avoid storing keys in VCS. If storing in
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
}).init();

// Initialize webdrivercss
webdrivercss.init(client, options.webdrivercss);

// Run the test
client
  .url(options.test.url)
  .webdrivercss(options.test.title, {
    name: options.test.name,
    elem: options.test.selector
  }, function(err, res) {
    console.log(err);
    console.log(res);
  })
  .end();
