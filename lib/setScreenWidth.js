'use strict';

/**
 * if multiple screen width are given resize browser dimension
 */

var q = require('q'),
    takenScreenSizes = {};

module.exports = function() {
    console.log('setScreenwidth');

    var that = this;
    this.newScreenSize = {};

    return q().then(function() {

        /**
         * get current browser resolution to change back to it
         * after all shots were taken (only if a screenWidth is set)
         */
        if(!that.self.defaultScreenDimension && that.screenWidth && that.screenWidth.length) {
            return that.instance.windowHandleSize().then(function(res) {
                that.self.defaultScreenDimension = res.value;
            });
        }

    }).then(function() {

        /**
         * if no screenWidth option was set just continue
         */
        if(!that.screenWidth || that.screenWidth.length === 0) {
            return;
        }

        that.newScreenSize.width = parseInt(that.screenWidth.shift(), 10);
        that.newScreenSize.height = parseInt(that.self.defaultScreenDimension.height, 10);

        that.self.takeScreenshot = false;
        if(!takenScreenSizes[that.pagename] || takenScreenSizes[that.pagename].indexOf(that.newScreenSize.width) < 0) {
            /**
             * set flag to retake screenshot
             */
            that.self.takeScreenshot = true;

            /**
             * cache already taken screenshot / screenWidth combinations
             */
            if(!takenScreenSizes[that.pagename]) {
                takenScreenSizes[that.pagename] = [that.newScreenSize.width];
            } else {
                takenScreenSizes[that.pagename].push(that.newScreenSize.width);
            }
        }


        /**
         * resize browser resolution
         * if shot will be taken in a specific screenWidth, rename file and append screen width
         * value in filename
         */
        var browserName     = that.instance.desiredCapabilities.browserName || that.instance.desiredCapabilities.browserName || 'unknown_device';
        browserName         = browserName.replace(/\s/g, '_').toLowerCase();

        that.baselinePath   = that.baselinePath.replace(/\.(baseline|regression|diff)\.png/,'.' + browserName + '.' + that.newScreenSize.width + 'px.$1.png');
        that.regressionPath = that.regressionPath.replace(/\.(baseline|regression|diff)\.png/,'.' + browserName + '.' + that.newScreenSize.width + 'px.$1.png');
        that.diffPath       = that.diffPath.replace(/\.(baseline|regression|diff)\.png/,  '.' + browserName + '.' + that.newScreenSize.width + 'px.$1.png');
        that.screenshot     = that.screenshot.replace(/\.png/, '.' + browserName + '.' + that.newScreenSize.width + 'px.png');
        that.filename       = that.baselinePath;

        return that.instance
            .setViewportSize({
                width: that.newScreenSize.width,
                height: that.newScreenSize.height
            })
            .pause(100);

    });
};
