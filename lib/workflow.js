'use strict';

/**
 * run regression test
 */

var q = require('q');

module.exports = function(pagename, args) {

    /*!
     * make sure that callback contains chainit callback
     */
    var cb = arguments[arguments.length - 1];

    this.needToSync = true;

    /*istanbul ignore next*/
    if (typeof args === 'function') {
        args = {};
    }

    if (!(args instanceof Array)) {
        args = [args];
    }

    /**
     * parameter type check
     */
    /*istanbul ignore next*/
    if (typeof pagename === 'function') {
        throw new Error('A pagename is required');
    }
    /*istanbul ignore next*/
    if (typeof args[0].name !== 'string') {
        throw new Error('You need to specify a name for your visual regression component');
    }

    var queuedShots = JSON.parse(JSON.stringify(args)),
        currentArgs = queuedShots[0];

    var context = {
        self: this,

        /**
         * default attributes
         */
        misMatchTolerance:      this.misMatchTolerance,
        screenshotRoot:         this.screenshotRoot,
        failedComparisonsRoot:  this.failedComparisonsRoot,

        instance:       this.instance,
        pagename:       pagename,
        applitools:     {
            apiKey: this.applitools.apiKey,
            appName: pagename,
            saveNewTests: this.applitools.saveNewTests,
            saveFailedTests: this.applitools.saveFailedTests,
            batchId: this.applitools.batchId // Group all sessions for this instance together.
        },
        currentArgs:    currentArgs,
        queuedShots:    queuedShots,
        baselinePath:   this.screenshotRoot + '/' + pagename + '.' + currentArgs.name + '.baseline.png',
        regressionPath: this.screenshotRoot + '/' + pagename + '.' + currentArgs.name + '.regression.png',
        diffPath:       this.failedComparisonsRoot + '/' + pagename + '.' + currentArgs.name + '.diff.png',
        screenshot:     this.screenshotRoot + '/' + pagename + '.png',
        isComparable:   false,
        warnings:       [],
        newScreenSize:  0,
        pageInfo:       null,
        updateBaseline: (typeof currentArgs.updateBaseline === 'boolean') ? currentArgs.updateBaseline : this.updateBaseline,
        screenWidth:    currentArgs.screenWidth || [].concat(this.screenWidth), // create a copy of the origin default screenWidth
        cb:             cb
    };

    /**
     * initiate result object
     */
    if(!this.resultObject[currentArgs.name]) {
        this.resultObject[currentArgs.name] = [];
    }

    return q()
        /**
         * initialize session
         */
        .then(require('./startSession.js').bind(context))

        /**
         * if multiple screen width are given resize browser dimension
         */
        .then(require('./setScreenWidth.js').bind(context))

        /**
         * make screenshot via [GET] /session/:sessionId/screenshot
         */
        .then(require('./makeScreenshot.js').bind(context))

        /**
         * check if files with id already exists
         */
        .then(require('./renameFiles.js').bind(context))

        /**
         * get page informations
         */
        .then(require('./getPageInfo.js').bind(context))

        /**
         * crop image according to user arguments and its position on screen and save it
         */
        .then(require('./cropImage.js').bind(context))

        /**
         * compare images
         */
        .then(require('./compareImages.js').bind(context))

        /**
         * save image diff
         */
        .then(require('./saveImageDiff.js').bind(context))

        /**
         * run workflow again or execute callback function
         */
        .then(require('./asyncCallback.js').bind(context));
};
