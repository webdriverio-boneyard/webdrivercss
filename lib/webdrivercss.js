/**
 * WebdriverCSS
 */

var fs    = require('fs'),
    gm    = require('gm'),
    glob  = require('glob'),
    async = require('async'),
    resemble = require('resemble');

var WebdriverCSS = module.exports = function(webdriverInstance, options) {
    options = options || {};

    if(!webdriverInstance) {
        throw new Error('A WebdriverJS instance is needed to initialise WebdriverCSS');
    }

    var that = this;

    this.webdriverInstance = webdriverInstance;
    this.screenshotRoot = options.screenshotRoot || 'webdrivercss';
    this.failedComparisonsRoot = options.failedComparisonsRoot || (this.screenshotRoot + '/diff');
    this.mismatchTolerance = options.mismatchTolerance || 0.05;

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
    this.webdriverInstance.addCommand('webdrivercss', function(id,args,cb) {
        var filenameCurrent = that.screenshotRoot + '/' + id + '.current.png',
            filenameNew = that.screenshotRoot + '/' + id + '.new.png',
            filenameDiff = that.failedComparisonsRoot + '/' + id + '.diff.png',
            filename = filenameCurrent,
            next = function() { this(null); },
            isComparable = false,
            screenshot, pageInfo;

        async.waterfall([

            /**
             * create screenshot via [GET] /session/:sessionId/screenshot
             */
            function(done) {
                that.webdriverInstance.screenshot(done)
            },

            /**
             * check if files with id already exists
             */
            function(res,done) {

                screenshot = new Buffer(res.value, 'base64');

                glob(that.screenshotRoot + '/' + id + '*', {}, function(err,files) {
                    console.log(files);

                    if(files.length === 0) return done(null);

                    isComparable = files.length > 1;
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

                if(!args.elem) return done(null);

                that.webdriverInstance.execute(function() {
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
                if(res.value.elemBounding) {

                    var cropDim = {
                        x: args.x || (res.value.elemBounding.left + (res.value.elemBounding.width / 2)),
                        y: args.y || (res.value.elemBounding.top + (res.value.elemBounding.height / 2)),
                        width: args.width || res.value.elemBounding.width,
                        height: args.height || res.value.elemBounding.height
                    }

                    gm(screenshot)
                        .quality(100)
                        .crop(cropDim.width, cropDim.height, cropDim.x - (cropDim.width / 2), cropDim.y - (cropDim.height / 2))
                        .write(filename, next.bind(done));
                
                } else {
                /**
                 * else save whole screenshot
                 * TODO return error that image wasn't found
                 */
                    gm(screenshot).quality(100).write(filename, next.bind(done));

                }

            },

            /**
             * compare images
             */
            function(done) {

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

                if(typeof imageDiff === 'function') return imageDiff(null);

                /**
                 * if set mismatchTolerance is smaller then compared mismatchTolerance
                 * make image diff
                 */
                if(that.mismatchTolerance < parseInt(data.misMatchPercentage,10)) {

                    var diff = new Buffer(data.getImageDataUrl().replace(/data:image\/png;base64,/,''), 'base64');
                    gm(diff).quality(100).write(filenameDiff, done);

                } else {

                /**
                 * otherwise delete diff
                 */
                    fs.exists(filenameDiff, function(exists) {

                        /**
                         * keep newest screenshot
                         */
                        fs.rename(filenameNew, filenameCurrent, done);

                        /**
                         * remove diff if exists
                         */
                        if(exists) {
                            fs.unlink(filenameDiff, done);
                        } else {
                            return done(null);
                        }

                    });
                }

            }
        ])
    })

}

WebdriverCSS.prototype