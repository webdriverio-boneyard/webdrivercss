'use strict';

/**
 * takes screenshot of the current viewport
 *
 * @param {String} filename  path of file to be saved
 */

var Promise = require('bluebird');
var gm = require('gm');
Promise.promisifyAll(gm.prototype);

module.exports = function viewportScreenshot(fileName) {

    var ErrorHandler = this.instance.ErrorHandler;

    /*!
     * parameter check
     */
    if (typeof fileName !== 'string') {
        return Promise.reject(
            new ErrorHandler.CommandError('number or type of arguments don\'t agree with saveScreenshot command'));
    }

    var self = this.instance;
    var response = {
        execute: [],
        screenshot: []
    };

    self.execute(getScrollingPosition, null)
    .then(function getWidthHeight() {
        /*eslint-disable*/
        return self.execute(function() {
            return {
                screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
            };
        });
        /*eslint-enable*/
    })
    .then(function(res) {
        response.execute.push(res);
        return self.screenshot();
    })
    .then(function(res) {
        response.screenshot = res;
        return gm(new Buffer(res.value, 'base64'))
        .crop(
            // width
            response.execute[1].value.screenWidth,
            // height
            response.execute[1].value.screenHeight,
            // top
            response.execute[0].value[0],
            // left
            response.execute[0].value[1]
        )
        .writeAsync(fileName);
    });

};

/*eslint-disable*/
function getScrollingPosition() {
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
/*eslint-enable*/
