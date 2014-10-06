/**
 * run regression test
 */

var async = require('async');

module.exports = function() {

    var pagename, args;

    if (this.usesApplitools) {
        pagename = this.appIdOrName;

        if (typeof arguments[0] !== 'object') {
            args = [{}];
        } else if (!(arguments[0] instanceof Array)) {
            args = [arguments[0]];
        }

        args[0].name = this.scenarioIdOrName;
    } else if (typeof arguments[0] === 'string') {
        pagename = arguments[0];
        args = arguments[1];
    }

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
        currentArgs = args.shift();

    var context = {
        self: this,

        /**
         * default attributes
         */
        defaultScreenDimension: this.defaultScreenDimension,
        misMatchTolerance:      this.misMatchTolerance,
        screenshotRoot:         this.screenshotRoot,
        failedComparisonsRoot:  this.failedComparisonsRoot,

        instance:       this.instance,
        pagename:       pagename,
        currentArgs:    currentArgs,
        queuedShots:    queuedShots,
        filenamePassed: this.screenshotRoot + '/' + pagename + '.' + currentArgs.name + '.passed.png',
        filenameFailed: this.screenshotRoot + '/' + pagename + '.' + currentArgs.name + '.failed.png',
        filenameDiff:   this.failedComparisonsRoot + '/' + pagename + '.' + currentArgs.name + '.diff.png',
        screenshot:     this.screenshotRoot + '/' + pagename + '.png',
        isComparable:   false,
        warnings:       [],
        newScreenSize:  0,
        pageInfo:       null,
        screenWidth:    currentArgs.screenWidth || this.screenWidth,
        cb:             cb
    };

    async.waterfall([

        /**
         * if multiple screen width are given resize browser dimension
         */
        require('./setScreenWidth.js').bind(context),

        /**
         * make screenshot via [GET] /session/:sessionId/screenshot
         */
        require('./makeScreenshot.js').bind(context),

        /**
         * check if files with id already exists
         */
        require('./renameFiles.js').bind(context),

        /**
         * get page informations
         */
        require('./getPageInfo.js').bind(context),

        /**
         * crop image according to user arguments and its position on screen and save it
         */
        require('./cropImage.js').bind(context),

        /**
         * compare images
         */
        require('./compareImages.js').bind(context),

        /**
         * save image diff
         */
        require('./saveImageDiff.js').bind(context)
    ],
        /**
         * run workflow again or execute callback function
         */
        require('./asyncCallback.js').bind(context)

    );
};
