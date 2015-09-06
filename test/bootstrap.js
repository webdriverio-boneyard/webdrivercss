/**
 * require dependencies
 */
WebdriverIO  = require('webdriverio');
WebdriverCSS = require('../index.js');
fs = require('fs-extra');
gm = require('gm');
glob = require('glob');
async  = require('async');
should = require('chai').should();
expect = require('chai').expect;
capabilities = {logLevel: 'silent',desiredCapabilities:{browserName: 'phantomjs'}};
testurl = 'http://localhost:8080/test/site/index.html';
testurlTwo = 'http://localhost:8080/test/site/two.html';
testurlThree = 'http://localhost:8080/test/site/three.html';
testurlFour = 'http://localhost:8080/test/site/four.html';

/**
 * set some fix test variables
 */
screenshotRootDefault = 'webdrivercss';
failedComparisonsRootDefault = 'webdrivercss/diff';
screenshotRootCustom = '__screenshotRoot__';
failedComparisonsRootCustom = '__failedComparisonsRoot__';

afterHook = function(done) {

    var browser = this.browser;

    /**
     * close browser and clean up created directories
     */
    async.parallel([
        function(done) { browser.end(done); },
        function(done) { fs.remove(failedComparisonsRootDefault,done); },
        function(done) { fs.remove(screenshotRootDefault,done); },
        function(done) { fs.remove(failedComparisonsRootCustom,done); },
        function(done) { fs.remove(screenshotRootCustom,done); }
    ], done);

};
