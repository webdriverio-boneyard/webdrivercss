/**
 * WebdriverCSS
 */

var fs = require('fs'),
    workflow = require('./workflow.js');

/**
 * initialise plugin
 */
var WebdriverCSS = module.exports.init = function(webdriverInstance, options) {
    options = options || {};

    if(!webdriverInstance) {
        throw new Error('A WebdriverJS instance is needed to initialise WebdriverCSS');
    }

    var that = this;

    this.screenshotRoot = options.screenshotRoot || 'webdrivercss';
    this.failedComparisonsRoot = options.failedComparisonsRoot || (this.screenshotRoot + '/diff');
    this.misMatchTolerance = options.misMatchTolerance || 0.05;
    this.screenWidth = options.screenWidth;
    this.warning = [];

    /**
     * create directory structure
     */
    fs.exists(this.screenshotRoot, function(exists) {
        if(!exists) {
            fs.mkdir(that.screenshotRoot, 0766, function() {
                fs.mkdir(that.failedComparisonsRoot, 0766);
            });
        }
    });

    /**
     * add WebdriverCSS command to WebdriverJS instance
     */
    webdriverInstance.addCommand('webdrivercss', workflow.bind(this, webdriverInstance));

    return this;
};