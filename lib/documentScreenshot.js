'use strict';

/**
 *
 * Save a screenshot as a base64 encoded PNG with the current state of the browser.
 *
 * <example>
    :saveScreenshot.js
    client
        // set browser window size
        .windowHandleSize({width: 500, height: 500})
        .saveScreenshot('viewport.png') // make screenshot of current viewport (500x500px)
        .saveScreenshot('wholeScreen.png', true) // makes screenshot of whole document (1280x1342px)
        .end();
 * </example>
 *
 * @param {String}   fileName    path of generated image (relative to the execution directory)
 * @param {Boolean=} totalScreen if true (default value) it takes a screenshot of whole website, otherwise only of current viewport
 *
 * @uses protocol/execute, utility/scroll, protocol/screenshot
 * @type utility
 *
 */

/* global document,window */

var async = require('async'),
    fs = require('fs'),
    gm = require('gm'),
    rimraf = require('rimraf'),
    generateUUID = require('./generateUUID.js'),
    path = require('path');

module.exports = function documentScreenshot(fileName) {

    var ErrorHandler = this.instance.ErrorHandler;

    /*!
     * make sure that callback contains chainit callback
     */
    var callback = arguments[arguments.length - 1];

    /*!
     * parameter check
     */
    if (typeof fileName !== 'string') {
        return callback(new ErrorHandler.CommandError('number or type of arguments don\'t agree with saveScreenshot command'));
    }

    var self = this.instance,
        response = {
            execute: [],
            screenshot: []
        },
        tmpDir = null,
        cropImages = [],
        currentXPos = 0,
        currentYPos = 0,
        screenshot = null,
        scrollFn = function(w, h) {
            /**
             * IE8 or older
             */
            if(document.all && !document.addEventListener) {
                /**
                 * this still might not work
                 * seems that IE8 scroll back to 0,0 before taking screenshots
                 */
                document.body.style.marginTop = '-' + h + 'px';
                document.body.style.marginLeft = '-' + w + 'px';
                return;
            }

            document.documentElement.style.webkitTransform = 'translate(-' + w + 'px, -' + h + 'px)';
            document.documentElement.style.mozTransform = 'translate(-' + w + 'px, -' + h + 'px)';
            document.documentElement.style.msTransform = 'translate(-' + w + 'px, -' + h + 'px)';
            document.documentElement.style.oTransform = 'translate(-' + w + 'px, -' + h + 'px)';
            document.documentElement.style.transform = 'translate(-' + w + 'px, -' + h + 'px)';
        };

    async.waterfall([

        /*!
         * create tmp directory to cache viewport shots
         */
        function(cb) {
            var uuid = generateUUID();
            tmpDir = path.join(__dirname, '..', '.tmp-' + uuid);

            fs.exists(tmpDir, function(exists) {
                return exists ? cb() : fs.mkdir(tmpDir, '0755', cb);
            });
        },

        /*!
         * prepare page scan
         */
        function() {
            var cb = arguments[arguments.length - 1];
            self.execute(function() {
                /**
                 * remove scrollbars
                 */
                // reset height in case we're changing viewports
                document.documentElement.style.height = 'auto';
                document.documentElement.style.height = document.documentElement.scrollHeight + 'px';
                document.documentElement.style.overflow = 'hidden';

                /**
                 * scroll back to start scanning
                 */
                window.scrollTo(0, 0);

                /**
                 * get viewport width/height and total width/height
                 */
                return {
                    screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                    screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                    documentWidth: document.documentElement.scrollWidth,
                    documentHeight: document.documentElement.scrollHeight,
                    devicePixelRatio: window.devicePixelRatio
                };
            }, cb);
        },

        /*!
         * take viewport shots and cache them into tmp dir
         */
        function(res, cb) {
            response.execute.push(res);

            /*!
             * run scan
             */
            async.whilst(

                /*!
                 * while expression
                 */
                function() {
                    return (currentXPos < (response.execute[0].value.documentWidth / response.execute[0].value.screenWidth));
                },

                /*!
                 * loop function
                 */
                function(finishedScreenshot) {
                    response.screenshot = [];

                    async.waterfall([

                        /*!
                         * take screenshot of viewport
                         */
                        self.screenshot.bind(self),

                        /*!
                         * cache image into tmp dir
                         */
                        function(res, cb) {
                            var file = tmpDir + '/' + currentXPos + '-' + currentYPos + '.png';
                            var image = gm(new Buffer(res.value, 'base64'));

                            if (response.execute[0].value.devicePixelRatio > 1) {
                                var percent = 100 / response.execute[0].value.devicePixelRatio;
                                image.resize(percent, percent, "%");
                            }

                            image.crop(response.execute[0].value.screenWidth, response.execute[0].value.screenHeight, 0, 0);
                            image.write(file, cb);
                            response.screenshot.push(res);

                            if (!cropImages[currentXPos]) {
                                cropImages[currentXPos] = [];
                            }

                            cropImages[currentXPos][currentYPos] = file;

                            currentYPos++;
                            if (currentYPos > Math.floor(response.execute[0].value.documentHeight / response.execute[0].value.screenHeight)) {
                                currentYPos = 0;
                                currentXPos++;
                            }
                        },

                        /*!
                         * scroll to next area
                         */
                        function() {
                            self.execute(scrollFn,
                                currentXPos * response.execute[0].value.screenWidth,
                                currentYPos * response.execute[0].value.screenHeight,
                                function(val, res) {
                                    response.execute.push(res);
                                }
                            ).pause(100).call(arguments[arguments.length - 1]);
                        }

                    ], finishedScreenshot);
                },
                cb
            );
        },

        /*!
         * concats all shots
         */
        function(cb) {
            var subImg = 0;

            async.eachSeries(cropImages, function(x, cb) {
                var col = gm(x.shift());
                col.append.apply(col, x);

                if (!screenshot) {
                    screenshot = col;
                    col.write(fileName, cb);
                } else {
                    col.write(tmpDir + '/' + (++subImg) + '.png', function() {
                        gm(fileName).append(tmpDir + '/' + subImg + '.png', true).write(fileName, cb);
                    });
                }
            }, cb);
        },

        /*!
         * crop screenshot regarding page size
         */
        function() {
            gm(fileName).crop(response.execute[0].value.documentWidth, response.execute[0].value.documentHeight, 0, 0).write(fileName, arguments[arguments.length - 1]);
        },

        /*!
         * remove tmp dir
         */
        function() {
            rimraf(tmpDir, arguments[arguments.length - 1]);
        },

        /*!
         * scroll back to start position
         */
        function(cb) {
            self.execute(scrollFn, 0, 0, cb);
        }
    ], function(err) {
        callback(err, null, response);
    });

};
