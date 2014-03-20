/**
 * WebdriverCSS
 */

var fs    = require('fs'),
    gm    = require('gm'),
    glob  = require('glob'),
    async = require('async'),
    resemble = require('resemble'),
    instance = null;

/**
 * initialise plugin
 */
var WebdriverCSS = module.exports.init = function(webdriverInstance, options) {
    options = options || {};

    if(!webdriverInstance) {
        throw new Error('A WebdriverJS instance is needed to initialise WebdriverCSS');
    }

    var that = this;
    instance = webdriverInstance;

    this.screenshotRoot = options.screenshotRoot || 'webdrivercss';
    this.failedComparisonsRoot = options.failedComparisonsRoot || (this.screenshotRoot + '/diff');
    this.mismatchTolerance = options.mismatchTolerance || 0.05;
    this.warning = [];

    /**
     * create directory structure
     */
    fs.exists(this.screenshotRoot, function(exists) {
        // TODO catch error
        if(!exists) {
            fs.mkdir(that.screenshotRoot, 0766, function() {
                fs.mkdir(that.failedComparisonsRoot, 0766);
            });
        }
    });

    /**
     * add WebdriverCSS command to WebdriverJS instance
     */
    instance.addCommand('webdrivercss', run.bind(this,instance));

    return this;
};

/**
 * run regression test
 */
var run = module.exports.run = function(instance, id, args, cb) {

    var that = this,
        filenameCurrent = that.screenshotRoot + '/' + id + '.current.png',
        filenameNew = that.screenshotRoot + '/' + id + '.new.png',
        filenameDiff = that.failedComparisonsRoot + '/' + id + '.diff.png',
        filename = filenameCurrent,
        isComparable = false,
        warnings = [],
        screenshot, pageInfo;

    // parameter type check
    if(typeof id === 'function') {
        throw new Error('A screenshot name is required');
    }

    if(typeof args === 'function') {
        cb = args;
        args = {};
    }

    async.waterfall([

        /**
         * create screenshot via [GET] /session/:sessionId/screenshot
         */
        function(done) {
            instance.screenshot(done);
        },

        /**
         * check if files with id already exists
         */
        function(res,done) {

            screenshot = new Buffer(res.value, 'base64');

            glob(that.screenshotRoot + '/' + id + '*', {}, function(err,files) {

                if(files.length === 0) return done(null);

                isComparable = true;
                filename = filenameNew;

                // rename existing files
                if(files.length === 2) {
                    fs.rename(filenameNew, filenameCurrent, done);
                } else {
                    return done(null);
                }

            });
        },

        /**
         * get page informations
         */
        function(done) {

            instance.execute(function() {
                return {
                    screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                    screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                    elemBounding: (arguments[0] && document.querySelector(arguments[0])) ? document.querySelector(arguments[0]).getBoundingClientRect() : null,
                    url: window.location.href
                }
            },args.elem,done);

        },

        /**
         * crop image according to user arguments and its position on screen and save it
         */
        function(res, done) {

            /**
             * if image was found use bounding values to crop image
             */
            if(args.x && args.y && args.width && args.height) {

                var cropDim = {
                    x:      args.x,
                    y:      args.y,
                    width:  args.width,
                    height: args.height
                }

                gm(screenshot)
                    .quality(100)
                    .crop(cropDim.width, cropDim.height, cropDim.x, cropDim.y)
                    .write(filename, done.bind(null, null));
            
            } else if(res.value && res.value.elemBounding) {

                var cropDim = {
                    x:      res.value.elemBounding.left + (res.value.elemBounding.width  / 2),
                    y:      res.value.elemBounding.top  + (res.value.elemBounding.height / 2),
                    width:  typeof args.width  !== 'undefined' ? args.width  : res.value.elemBounding.width,
                    height: typeof args.height !== 'undefined' ? args.height : res.value.elemBounding.height
                }

                gm(screenshot)
                    .quality(100)
                    .crop(cropDim.width, cropDim.height, cropDim.x - (cropDim.width / 2), cropDim.y - (cropDim.height / 2))
                    .write(filename, done.bind(null, null));

            } else {
            /**
             * else save whole screenshot
             * TODO return error that image wasn't found
             */
                logWarning(args.elem ? 'NoElementFound' : 'ArgumentsMailformed');
                gm(screenshot).quality(100).write(filename, done.bind(null, null));

            }

        },

        /**
         * compare images
         */
        function() {

            /**
             * need to find done function because gm doesn't have node like callbackes (err,res)
             */
            var params = Array.prototype.slice.call(arguments),
                done = params[params.length - 1];

            if(!isComparable) return done(null);

            resemble
                .resemble(filenameCurrent)
                .compareTo(filenameNew)
                .onComplete(done.bind(null,null));

        },

        /**
         * save image diff
         */
        function(imageDiff,done) {

            var resultObject = {};

            if(typeof imageDiff === 'function') {
                resultObject = {
                    message: 'first image with id "' + id + '" successfully taken',
                    isSameDimensions: true,
                    misMatchPercentage: 0,
                    filePath: filenameCurrent
                }

                return imageDiff(null, resultObject);
            }

            imageDiff.mismatchTolerance = parseInt(imageDiff.misMatchPercentage,10);

            /**
             * if set mismatchTolerance is smaller then compared mismatchTolerance
             * make image diff
             */
            if(that.mismatchTolerance < imageDiff.misMatchPercentage) {

                if(!imageDiff.isSameDimensions) {
                    logWarning('DimensionWarning')
                }

                resultObject = {
                    message: 'mismatch tolerance exceeded (+' + (imageDiff.mismatchTolerance - that.mismatchTolerance) + '), image-diff created',
                    misMatchPercentage: imageDiff.misMatchPercentage,
                    isSameDimensions: imageDiff.isSameDimensions,
                    imageDiffPath: filenameDiff
                }

                var diff = new Buffer(imageDiff.getImageDataUrl().replace(/data:image\/png;base64,/,''), 'base64');
                gm(diff).quality(100).write(filenameDiff, done.bind(null,null,resultObject));

            } else {

            /**
             * otherwise delete diff
             */
                fs.exists(filenameDiff, function(exists) {

                    /**
                     * keep newest screenshot
                     */
                    fs.rename(filenameNew, filenameCurrent);

                    /**
                     * remove diff if exists
                     */
                    if(exists) {
                        fs.unlink(filenameDiff);
                    }

                });

                /**
                 * return result object to WebdriverJS instance
                 */
                
                resultObject = {
                    message: 'mismatch tolerance not exceeded (~' + imageDiff.mismatchTolerance + '), removed old screenshot',
                    misMatchPercentage: imageDiff.misMatchPercentage,
                    isSameDimensions: imageDiff.isSameDimensions,
                    filePath: filenameCurrent
                }

                done(null,resultObject);
            }
        }
    ], cb);
}

/**
 * prints warning message within WebdriverJS instance
 * @param  {String} id  error type
 */
var logWarning = function(id) {
    var prefix = '\x1b[1;32mWebdriverCSS\x1b[0m\t';

    switch(id) {
        case 'NoElementFound':
        instance.logger.log(prefix + 'Couldn\'t find element on page');
        instance.logger.log(prefix + 'taking screenshot of whole website'); break;
        
        case 'ArgumentsMailformed':
        instance.logger.log(prefix + 'Arguments are malformed');
        instance.logger.log(prefix + 'taking screenshot of whole website'); break;

        case 'DimensionWarning':
        instance.logger.log(prefix + 'new image snapshot has a different dimension'); break;
        
        default:
        instance.logger.log(prefix + 'Unknown warning');
    }
}