/**
 * require dependencies
 */
WebdriverJS  = require('webdriverjs');
WebdriverCSS = require('../index.js');
fs = require('fs-extra');
gm = require('gm');
async  = require('async');
should = require('chai').should();
expect = require('chai').expect;
capabilities = process.env.TRAVIS_BUILD_NUMBER ? require('./conf/travis.js') : require('./conf/local.js');
testurl = 'http://localhost:8080/test/site/index.html';

/**
 * set some fix test variables
 */
screenshotRootDefault = 'webdrivercss';
failedComparisonsRootDefault = 'webdrivercss/diff';
screenshotRootCustom = '__screenshotRoot__';
failedComparisonsRootCustom = '__failedComparisonsRoot__';

before(function() {
    this.browser = WebdriverJS.remote(capabilities);
});

after(function(done) {

    var browser = this.browser;

    /**
     * close browser and clean up created directories
     */
    async.parallel([
        function(done) { browser.end(done) },
        function(done) { fs.remove(failedComparisonsRootDefault,done) },
        function(done) { fs.remove(screenshotRootDefault,done) },
        function(done) { fs.remove(failedComparisonsRootCustom,done) },
        function(done) { fs.remove(screenshotRootCustom,done) }
    ], done);

});