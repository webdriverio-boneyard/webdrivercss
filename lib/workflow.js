'use strict';

/**
 * run regression test
 */

var startSession = require('./startSession.js');
var setScreenWidth = require('./setScreenWidth.js');
var makeScreenshot = require('./makeScreenshot.js');
var renameFiles = require('./renameFiles.js');
var getPageInfo = require('./getPageInfo.js');
var cropImage = require('./cropImage.js');
var compareImages = require('./compareImages.js');
var saveImageDiff = require('./saveImageDiff.js');
var asyncCallback = require('./asyncCallback.js');


function workflow(pagename, args) {
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
        screenWidth:    currentArgs.screenWidth || [].concat(this.screenWidth) // create a copy of the origin default screenWidth
    };

    /**
     * initiate result object
     */
    if(!this.resultObject[currentArgs.name]) {
        this.resultObject[currentArgs.name] = [];
    }

    return startSession.bind(context)
    .then(function() {
        return setScreenWidth.apply(context, arguments);
    })
    .then(function() {
        return makeScreenshot.apply(context, arguments);
    })
    .then(function() {
        return renameFiles.apply(context, arguments);
    })
    .then(function() {
        return getPageInfo.apply(context, arguments);
    })
    .then(function() {
        return cropImage.apply(context, arguments);
    })
    .then(function() {
        return compareImages.apply(context, arguments);
    })
    .then(function() {
        return saveImageDiff.apply(context, arguments);
    })
    .then(function() {
        return asyncCallback.apply(context, arguments);
    });
}

module.exports = workflow;
