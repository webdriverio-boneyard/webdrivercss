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
    fs.exists('./' + this.screenshotRoot, function(exists) {
        // TODO catch error
        if(!exists) {
            fs.mkdir('./' + that.screenshotRoot, 0766, function() {
                fs.mkdir('./' + that.failedComparisonsRoot, 0766);
            });
        }
    });

    /**
     * add WebdriverCSS command to WebdriverJS instance
     */
    this.webdriverInstance.addCommand('webdrivercss', function(id,args,cb) {
        var filename = that.screenshotRoot + '/' + id + '.current.png',
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

                glob(this.screenshotRoot + '/' + id + '*', {}, function(err,files) {

                    if(files.length === 0) return done(null);

                    isComparable = files.length > 1;
                    filename = that.screenshotRoot + '/' + id + '.new.png';

                    // rename existing files
                    if(files.length === 2) {
                        fs.rename(that.screenshotRoot + '/' + id + '.new.png', that.screenshotRoot + '/' + id + '.current.png', done);
                    } else {
                        return done(null);
                    }

                });
            },

            /**
             * get page informations
             */
            function(done) {

                if(!args.elem) {
                    return done(null);
                }

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
                        .write(filename, done);
                
                } else {
                /**
                 * else save whole screenshot
                 * TODO return error that image wasn't found
                 */
                    gm(screenshot).quality(100).write(filename, done);

                }

            },

            /**
             * compare images
             */
            function(done) {

                if(isComparable) {

                }

            }
        ])
    })

}

WebdriverCSS.prototype