/**
 * run regression test
 */

module.exports = function(instance, id, args, cb) {

    // parameter type check
    if(typeof id === 'function') {
        throw new Error('A screenshot ID is required');
    }

    if(typeof args === 'function') {
        cb = args;
        args = {};
    }

    this.context = {
        instance:        instance,
        id:              id,
        args:            args,
        cb:              cb,
        filename:        this.screenshotRoot + '/' + id + '.current.png',
        filenameCurrent: this.screenshotRoot + '/' + id + '.current.png',
        filenameNew:     this.screenshotRoot + '/' + id + '.new.png',
        filenameDiff:    this.failedComparisonsRoot + '/' + id + '.diff.png',
        isComparable:    false,
        warnings:        [],
        newScreenSize:   0,
        screenWidth:     this.screenWidth || args.screenWidth,
        screenshot:      null,
        pageInfo:        null,
        defaultScreenDimension: this.defaultScreenDimension,
        misMatchTolerance: this.misMatchTolerance,
        screenshotRoot: this.screenshotRoot,
        failedComparisonsRoot: this.failedComparisonsRoot
    };

    async.waterfall([

        /**
         * wait a certain amount of time to load things properly
         */
        require('./timeout.js').bind(this.context),

        /**
         * if multiple screen width are given resize browser dimension
         */
        require('./setScreenWidth.js').bind(this.context),

        /**
         * make screenshot via [GET] /session/:sessionId/screenshot
         */
        require('./makeScreenshot.js').bind(this.context),

        /**
         * check if files with id already exists
         */
        require('./renameFiles.js').bind(this.context),

        /**
         * get page informations
         */
        require('./getPageInfo.js').bind(this.context),

        /**
         * crop image according to user arguments and its position on screen and save it
         */
        require('./cropImage.js').bind(this.context),

        /**
         * compare images
         */
        require('./compareImages.js').bind(this.context),

        /**
         * save image diff
         */
        require('./saveImageDiff.js').bind(this.context)
    ],
        /**
         * run workflow again or execute callback function
         */
        require('./asyncCallback.js').bind(this.context)

    );
};