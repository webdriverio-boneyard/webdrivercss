/**
 * require dependencies
 */
WebdriverJS = require('webdriverjs');
WebdriverCSS = require('../index.js');
fs = require('fs');
async = require('async');
should = require('chai').should();
expect = require('chai').expect;
capabilities = process.env.TRAVIS_BUILD_NUMBER ? require('./conf/travis.js') : require('./conf/local.js');

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
    
    /**
     * close browser
     */
    this.browser.end();

    /**
     * clean up created directories
     */
    async.parallel([
        function(done) { fs.rmdir(failedComparisonsRootDefault,done) },
        function(done) { fs.rmdir(screenshotRootDefault,done) },
        function(done) { fs.rmdir(failedComparisonsRootCustom,done) },
        function(done) { fs.rmdir(screenshotRootCustom,done) }
    ], done);

});