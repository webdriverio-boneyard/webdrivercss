'use strict';

/**
 * takes screenshot of the current viewport
 *
 * @param {String} filename  path of file to be saved
 */

var q = require('q'),
    gm = require('gm');

module.exports = function viewportScreenshot(fileName) {

    var ErrorHandler = this.instance.ErrorHandler;

    /*!
     * parameter check
     */
    if (typeof fileName !== 'string') {
        return callback(new ErrorHandler.CommandError('number or type of arguments don\'t agree with saveScreenshot command'));
    }

    var self = this.instance,
        scrollPosition, screenDimension,
        response = {
            execute: [],
            screenshot: []
        };

    var getScrollingPosition = function() {
        var position = [0, 0];
        if (typeof window.pageYOffset !== 'undefined') {
            position = [
                window.pageXOffset,
                window.pageYOffset
            ];
        } else if (typeof document.documentElement.scrollTop !== 'undefined' && document.documentElement.scrollTop > 0) {
            position = [
                document.documentElement.scrollLeft,
                document.documentElement.scrollTop
            ];
        } else if (typeof document.body.scrollTop !== 'undefined') {
            position = [
                document.body.scrollLeft,
                document.body.scrollTop
            ];
        }
        return position;
    };

    q().then(function() {

        /*!
         * get scroll position
         */
        return self.execute(getScrollingPosition, null, cb);

    }).then(function(res) {
        scrollPosition = res.value;

        /*!
         * get viewport width/height and total width/height
         */
        return self.execute(function() {
            return {
                screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
            };
        });

    }).then(function(res) {
        screenDimension = res.value;

        /**
         * take screenshot
         */
        return self.screenshot(cb);

    }).then(function() {

        var image = gm(new Buffer(res.value, 'base64')).crop(
            // width
            response.execute[1].value.screenWidth,
            // height
            response.execute[1].value.screenHeight,
            // top
            response.execute[0].value[0],
            // left
            response.execute[0].value[1]
        );

        return q.nfcall(image.write.bind(image), fileName);

    });

};
