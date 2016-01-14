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

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var gm = require('gm');
Promise.promisifyAll(gm.prototype);
var rimraf = Promise.promisify(require('rimraf'));
var generateUUID = require('./generateUUID.js');
var path = require('path');

module.exports = function documentScreenshot(fileName) {

    var ErrorHandler = this.instance.ErrorHandler;

    /*!
     * parameter check
     */
    if (typeof fileName !== 'string') {
        return Promise.reject(
            new ErrorHandler.CommandError('first parameter to documentScreenshot() must be a string fileName'));
    }

    var self = this.instance;
    var response = {
        execute: [],
        screenshot: []
    };
    var tmpDir = null;
    var cropImages = [];
    var currentXPos = 0;
    var currentYPos = 0;
    var screenshot = null;

    /*!
     * create tmp directory to cache viewport shots
     */
    return Promise.try(function createTmp() {
        var uuid = generateUUID();
        tmpDir = path.join(__dirname, '..', '.tmp-' + uuid);

        return fs.existsAsync(tmpDir)
        .then(function(exists) {
            if (!exists) return fs.mkdirAsync(tmpDir, '0755');
        });
    })
    /*!
     * prepare page scan
     */
    .then(function pageScan() {
        return self.execute(getViewportSize);
    })
    /*!
     * take viewport shots and cache them into tmp dir
     */
     .then(function takeShots(res) {
        response.execute.push(res);
        response.screenshot = [];

        function takeScreenshot() {

            // Take screenshot
            return self.screenshot.call(self)
            // Cache image into tmp dir
            .then(function cacheImage(res) {
                var file = tmpDir + '/' + currentXPos + '-' + currentYPos + '.png';
                var image = gm(new Buffer(res.value, 'base64'));

                if (response.execute[0].value.devicePixelRatio > 1) {
                    var percent = 100 / response.execute[0].value.devicePixelRatio;
                    image.resize(percent, percent, "%");
                }

                image.crop(response.execute[0].value.screenWidth, response.execute[0].value.screenHeight, 0, 0);
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
                return image.writeAsync(file);
            })
            // scroll to next area
            .then(function scrollToNext() {
                return self.execute(scrollFn,
                    currentXPos * response.execute[0].value.screenWidth,
                    currentYPos * response.execute[0].value.screenHeight
                )
                .then(function (res) {
                    response.execute.push(res);
                })
                // FIXME do we need this?
                .pause(100);
            });
        }

        // async while expression
        function loop() {
            return takeScreenshot()
            .then(function checkIfDone() {
                if (currentXPos < (response.execute[0].value.documentWidth / response.execute[0].value.screenWidth)) {
                    return loop();
                }
            });
        }

        /*!
         * run scan
         */
        return loop();
    })
   // FIXME this seems like an optimization opportunity, we're thrashing disk;
   // could also append in the loop above
    .then(function concat() {
        var subImg = 0;
        return Promise.mapSeries(cropImages, function(item) {
            var col = gm(item.shift());
            col.append.apply(col, item);

            if (!screenshot) {
                screenshot = col;
                return col.writeAsync(fileName);
            } else {
                return col.writeAsync(tmpDir + '/' + (++subImg) + '.png')
                .then(function() {
                    return gm(fileName).append(tmpDir + '/' + subImg + '.png', true).writeAsync(fileName);
                });
            }
        });
    })
    /*!
     * crop screenshot regarding page size
     */
    .then(function cropScreenshot() {
        return gm(fileName)
        .crop(response.execute[0].value.documentWidth, response.execute[0].value.documentHeight, 0, 0)
        .writeAsync(fileName);
    })
    /*!
     * remove tmp dir
     */
    .then(function() {
        return rimraf(tmpDir);
    })
    /*!
     * scroll back to start position
     */
    .then(function() {
        return self.execute(scrollFn, 0, 0);
    })
    // Return response object.
    .return(response);
};

/*eslint-disable*/
function scrollFn(w, h) {
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

function getViewportSize() {
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
}
/*eslint-enable*/
