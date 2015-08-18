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

var q = require('q'),
    fs = require('fs'),
    gm = require('gm'),
    rimraf = require('rimraf'),
    generateUUID = require('./generateUUID'),
    scrollFn = require('./browser/scroll'),
    prepareScanFn = require('./browser/prepareScan'),
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
        uuid = generateUUID(),
        tmpDir = path.join(__dirname, '..', '.tmp-' + uuid),
        cropImages = [],
        currentXPos = 0,
        currentYPos = 0,
        screenshot = null;

    /*!
     * create tmp directory to cache viewport shots
     */
    if(!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, '0755');
    }

    return q().then(function() {

        /*!
         * prepare page scan
         */
        return self.execute(prepareScanFn);

    }).then(function(res) {

        /*!
         * take viewport shots and cache them into tmp dir
         */
        response.execute.push(res);

        /*!
         * run scan
         */

        var captureLoop = function(finishedScreenshot) {
            response.screenshot = [];

            return q().then(function() {

                /*!
                 * take screenshot of viewport
                 */
                return self.screenshot();

            }).then(function(res) {

                /*!
                 * cache image into tmp dir
                 */
                var file = tmpDir + '/' + currentXPos + '-' + currentYPos + '.png',
                    defer = q.defer();

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

                gm(new Buffer(res.value, 'base64')).crop(response.execute[0].value.screenWidth, response.execute[0].value.screenHeight, 0, 0).write(file, function() {
                    defer.resolve();
                });

                return defer.promise;

            }).then(function() {

                /*!
                 * scroll to next area
                 */
                return self.execute(
                    scrollFn,
                    currentXPos * response.execute[0].value.screenWidth,
                    currentYPos * response.execute[0].value.screenHeight
                ).then(function(res) {
                    response.execute.push(res);
                }).pause(100);

            });
        },

         /*!
         * while expression
         */
        // function() {
        //     return (currentXPos < (response.execute[0].value.documentWidth / response.execute[0].value.screenWidth));
        // },

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
        },

        /**
         * enable scrollbars again
         */
        function(res, cb) {
            response.execute.push(res);
            self.execute(function() {
                document.body.style.overflow = 'visible';
            }, cb);
        }
    ], function(err) {
        callback(err, null, response);
    });

};
