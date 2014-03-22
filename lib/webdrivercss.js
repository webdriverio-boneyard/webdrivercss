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
    this.misMatchTolerance = options.misMatchTolerance || 0.05;
    this.screenWidth = options.screenWidth;
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
var run = function(instance, id, args, cb) {

    var that = this,
        filenameCurrent = that.screenshotRoot + '/' + id + '.current.png',
        filenameNew = that.screenshotRoot + '/' + id + '.new.png',
        filenameDiff = that.failedComparisonsRoot + '/' + id + '.diff.png',
        filename = filenameCurrent,
        isComparable = false,
        warnings = [],
        newScreenSize = 0,
        screenWidth = that.screenWidth || args.screenWidth,
        screenshot, pageInfo;

    // parameter type check
    if(typeof id === 'function') {
        throw new Error('A screenshot ID is required');
    }

    if(typeof args === 'function') {
        cb = args;
        args = {};
    }

    async.waterfall([

        /**
         * wait a certain amount of time to load things properly
         */
        function(done) {
            if(!args.timeout || typeof args.timeout !== 'number') return done();
            instance.pause(args.timeout).call(done);
        },

        /**
         * if multiple screen width are given resize browser dimension
         */
        function(done) {

            if(screenWidth && screenWidth.length > 0) {

                /**
                 * get current browser resolution to change back to it
                 * after all shots were taken
                 */
                if(!that.defaultScreenDimension) {
                    instance.windowHandleSize(function(err,res) {
                        that.defaultScreenDimension = res.value;
                    });
                }

                newScreenSize = {};

                /**
                 * resize browser resolution
                 */
                instance
                    .call(function() {
                        newScreenSize.width = screenWidth.pop();
                        newScreenSize.height = that.defaultScreenDimension.height;

                        /**
                         * if shot will be taken in a specific screenWidth, rename file and append screen width
                         * value in filename
                         */
                        if(newScreenSize) {
                            filenameCurrent = filenameCurrent.replace(/\.(current|new|diff)\.png/,'.$1.' + newScreenSize.width + 'px.png');
                            filenameNew = filenameNew.replace(/\.(current|new|diff)\.png/,'.$1.' + newScreenSize.width + 'px.png');
                            filenameDiff = filenameDiff.replace(/\.(current|new|diff)\.png/,'.$1.' + newScreenSize.width + 'px.png');
                            filename = filenameCurrent;
                        }

                        instance.windowHandleSize({width: newScreenSize.width, height: newScreenSize.height}, function() {
                            done();
                        });
                    });

            } else {

                /**
                 * if no screenWidth option was set just continue
                 */
                done();

            }

        },

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

            glob('{' + filenameCurrent + ',' + filenameNew + '}', {}, function(err,files) {
                if(files.length === 0) return done();

                isComparable = true;
                filename = filenameNew;

                // rename existing files
                if(files.length === 2) {
                    fs.rename(filenameNew, filenameCurrent, done);
                } else {
                    return done();
                }

            });
        },

        /**
         * get page informations
         */
        function(done) {

            /**
             * ==================================================
             * ******** frontend code starts here ***************
             * ==================================================
             */
            instance.execute(function() {

                var exclude = arguments[1],
                    excludeRect = [];

                /**
                 * little helper function to check against argument values
                 * @param  {Object}  variable  some variable
                 * @return {Boolean}           is true if typeof variable is number
                 */
                function isNumber(variable) {
                    return typeof variable === 'number';
                }

                /**
                 * exclude param is CSS selector string
                 */
                if(exclude && typeof exclude === 'string') {
                    var elemsRect = document.querySelectorAll(exclude);

                    for(var i = 0; i < elemsRect.length; ++i) {
                        var elemRect = elemsRect[i].getBoundingClientRect();

                        excludeRect.push({
                            x0: elemRect.left,
                            y0: elemRect.top,
                            x1: elemRect.left + elemRect.width,
                            y1: elemRect.top + elemRect.height
                        });
                    }

                /**
                 * exclude param is set of x,y rectangle
                 */
                } else if(exclude && exclude instanceof Array) {

                    exclude.forEach(function(item,i) {

                        if(isNumber(item.x0) && isNumber(item.x1) && isNumber(item.y0) && isNumber(item.y1)) {
                            excludeRect.push(item);
                        }

                    });

                /**
                 * exclude param is x,y rectangle
                 */
                } else if(exclude && isNumber(exclude.x0) && isNumber(exclude.x1) && isNumber(exclude.y0) && isNumber(exclude.y1)) {
                    excludeRect.push(exclude);
                }

                return {
                    screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                    screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                    elemBounding: (arguments[0] && document.querySelector(arguments[0])) ? document.querySelector(arguments[0]).getBoundingClientRect() : null,
                    excludeRect: excludeRect,
                    url: window.location.href
                }

            },[args.elem,args.exclude],done);
            /**
             * ==================================================
             * ********** frontend code ends here ***************
             * ==================================================
             */

        },

        /**
         * crop image according to user arguments and its position on screen and save it
         */
        function(res, done) {

            var excludeRect = res.value ? res.value.excludeRect : [],
                shot = {};

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

                shot = gm(screenshot).quality(100);

                /**
                 * exclude parts within page by drawing black rectangle
                 */
                excludeRect.forEach(function(rect,i) {
                    shot.drawRectangle(rect.x0, rect.y0, rect.x1, rect.y1);
                });
                    
                shot.crop(cropDim.width, cropDim.height, cropDim.x, cropDim.y)
                    .write(filename, done.bind(null, null));
            
            } else if(res.value && res.value.elemBounding) {

                var cropDim = {
                    x:      res.value.elemBounding.left + (res.value.elemBounding.width  / 2),
                    y:      res.value.elemBounding.top  + (res.value.elemBounding.height / 2),
                    width:  typeof args.width  !== 'undefined' ? args.width  : res.value.elemBounding.width,
                    height: typeof args.height !== 'undefined' ? args.height : res.value.elemBounding.height
                }

                shot = gm(screenshot).quality(100);
                
                /**
                 * exclude parts within page by drawing black rectangle
                 */
                excludeRect.forEach(function(rect,i) {
                    shot.drawRectangle(rect.x0, rect.y0, rect.x1, rect.y1);
                });
                    
                shot.crop(cropDim.width, cropDim.height, cropDim.x - (cropDim.width / 2), cropDim.y - (cropDim.height / 2))
                    .write(filename, done.bind(null, null));

            } else {
            /**
             * else save whole screenshot
             * TODO return error that image wasn't found
             */
                logWarning(args.elem ? 'NoElementFound' : 'ArgumentsMailformed');
                
                shot = gm(screenshot).quality(100);

                /**
                 * exclude parts within page by drawing black rectangle
                 */
                excludeRect.forEach(function(rect,i) {
                    shot.drawRectangle(rect.x0, rect.y0, rect.x1, rect.y1);
                });
                    
                shot.write(filename, done.bind(null, null));

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

            if(!isComparable) return done();

            resemble
                .resemble(filenameCurrent)
                .compareTo(filenameNew)
                .onComplete(done.bind(null,null));

        },

        /**
         * save image diff
         */
        function(imageDiff,done) {

            var resultObject = {},
                misMatchTolerance = parseFloat(imageDiff.misMatchPercentage,10);

            if(typeof imageDiff === 'function') {
                resultObject = {
                    message: 'first image with id "' + id + '" successfully taken',
                    isSameDimensions: true,
                    misMatchPercentage: 0
                }

                return imageDiff(null, resultObject);
            }

            /**
             * if set misMatchTolerance is smaller then compared misMatchTolerance
             * make image diff
             */
            if(that.misMatchTolerance < misMatchTolerance) {

                if(!imageDiff.isSameDimensions) {
                    logWarning('DimensionWarning')
                }

                resultObject = {
                    message: 'mismatch tolerance exceeded (+' + (misMatchTolerance - that.misMatchTolerance) + '), image-diff created',
                    misMatchPercentage: misMatchTolerance,
                    isSameDimensions: imageDiff.isSameDimensions
                }

                var diff = new Buffer(imageDiff.getImageDataUrl().replace(/data:image\/png;base64,/,''), 'base64');
                gm(diff).quality(100).write(filenameDiff, done.bind(null,null,resultObject));

            } else {

            /**
             * otherwise delete diff
             */

                async.waterfall([
                    /**
                     * check if diff shot exists
                     */
                    function(done) {
                        fs.exists(filenameDiff,done.bind(null,null));
                    },
                    /**
                     * remove diff if yes
                     */
                    function(exists,done) {
                        if(exists) {
                            fs.unlink(filenameDiff,done);
                        } else {
                            done();
                        }
                    },
                    /**
                     * keep newest screenshot
                     */
                    function(done) {
                        fs.rename(filenameNew, filenameCurrent, done);
                    }
                ], function(err) {

                    /**
                     * return result object to WebdriverJS instance
                     */
                    resultObject = {
                        message: 'mismatch tolerance not exceeded (~' + misMatchTolerance + '), removed old screenshot',
                        misMatchPercentage: misMatchTolerance,
                        isSameDimensions: imageDiff.isSameDimensions
                    }

                    done(err,resultObject);

                });

            }
        }
    ], function(err,res) {

        /**
         * if error occured don't do another shot (if multiple screen width are set)
         */
        if(err) return cb(err);

        /**
         * if multiple screen width are set
         */
        if(screenWidth) {

            /**
             * start workflow all over again with same parameter
             */
            if(screenWidth.length > 0) {
                return run.call(that, instance, id, args, cb);
            }

            /**
             * when all shots have been made, get back to old resolution
             */
            instance.windowHandleSize({
                width: that.defaultScreenDimension.width,
                height: that.defaultScreenDimension.height
            }, function(err) {
                cb(err,res);
            })

        } else {
            cb(err,res);
        }

    });
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
        instance.logger.log(prefix + 'No element or bounding is given');
        instance.logger.log(prefix + 'taking screenshot of whole website'); break;

        case 'DimensionWarning':
        instance.logger.log(prefix + 'new image snapshot has a different dimension'); break;
        
        default:
        instance.logger.log(prefix + 'Unknown warning');
    }
}