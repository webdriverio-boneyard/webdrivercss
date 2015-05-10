'use strict';

/**
 * WebdriverCSS
 */

var fs = require('fs-extra'),
    workflow = require('./workflow.js'),
    viewportScreenshot = require('./viewportScreenshot.js'),
    documentScreenshot = require('./documentScreenshot.js'),
    generateUUID = require('./generateUUID.js'),
    syncImages = require('./syncImages');

/**
 * initialise plugin
 */
var WebdriverCSS = function(webdriverInstance, options) {
    options = options || {};

    if(!webdriverInstance) {
        throw new Error('A WebdriverIO instance is needed to initialise WebdriverCSS');
    }

    /**
     * general options
     */
    this.screenshotRoot = options.screenshotRoot || 'webdrivercss';
    this.failedComparisonsRoot = options.failedComparisonsRoot || (this.screenshotRoot + '/diff');
    this.misMatchTolerance = options.misMatchTolerance || 0.05;
    this.screenWidth = options.screenWidth || [];
    this.warning = [];
    this.resultObject = {};
    this.instance = webdriverInstance;
    this.updateBaseline = (typeof options.updateBaseline === 'boolean') ? options.updateBaseline : false;

    /**
     * sync options
     */
    this.key = options.key;
    this.applitools = {
        apiKey: options.key,
        saveNewTests: true, // currently will always happen.
        saveFailedTests: this.updateBaseline,
        batchId: generateUUID()
    };
    this.host = 'https://eyessdk.applitools.com';
    this.headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    this.reqTimeout = 5 * 60 * 1000;
    this.user = options.user;
    this.api  = options.api;
    this.usesApplitools = typeof this.applitools.apiKey === 'string' && !this.api;
    this.saveImages = options.saveImages || !this.usesApplitools;

    /**
    * create directory if it doesn't already exist
    */
    var createDirectory = function(path) {
        if(!fs.existsSync(path)) {
            fs.mkdirsSync(path, '0755', true);
        }
    };

    createDirectory(this.screenshotRoot);
    createDirectory(this.failedComparisonsRoot);

    /**
     * add WebdriverCSS command to WebdriverIO instance
     */
    this.instance.addCommand('saveViewportScreenshot', viewportScreenshot.bind(this));
    this.instance.addCommand('saveDocumentScreenshot', documentScreenshot.bind(this));
    this.instance.addCommand('webdrivercss', workflow.bind(this));
    this.instance.addCommand('sync', syncImages.bind(this));

    return this;
};

/**
 * expose WebdriverCSS
 */
module.exports.init = function(webdriverInstance, options) {
    return new WebdriverCSS(webdriverInstance, options);
};
