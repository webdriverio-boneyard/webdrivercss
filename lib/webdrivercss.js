/**
 * WebdriverCSS
 */

var fs    = require('fs'),
    gm    = require('gm'),
    async = require('async');

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
            screenshot, pageInfo;

        async.waterfall([

            /**
             * check if file with id already exists
             */
            function(done) {
                fs.exists(filename, function(exists) {
                    if(exists) {
                        filename = that.screenshotRoot + '/' + id + '.new.png'
                    }

                    return done(null)
                })
            },
            
            /**
             * create screenshot via [GET] /session/:sessionId/screenshot
             */
            function(done) {
                that.webdriverInstance.screenshot(done)
            },

            /**
             * get page informations
             */
            function(res,done) {
                screenshot = new Buffer(res.value, 'base64');

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
                },args.elem,done)
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

            }
        ])
    })

}

WebdriverCSS.prototype