'use strict';

/**
 * takes screenshot of the current viewport
 *
 * @param {String} filename  path of file to be saved
 */

var async = require('async'),
    gm = require('gm'),
    q = require('q');

module.exports = function viewportScreenshot(fileName) {

    var ErrorHandler = this.instance.ErrorHandler;
    var defer = q.defer();

    /*!
     * parameter check
     */
    if (typeof fileName !== 'string') {
        defer.reject(new ErrorHandler.CommandError('number or type of arguments don\'t agree with saveScreenshot command'));
        return defer.promise;
    }

    var self = this.instance,
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

    async.waterfall([

        /*!
         * get scroll position
         */
        function(cb) {
            self.execute(getScrollingPosition, null)
                .then(function (res) {
                    cb(null, res);
                })
                .catch(function (err) {
                    cb(err);
                });
        },

        /*!
         * get viewport width/height and total width/height
         */
        function(res, cb) {
            response.execute.push(res);

            self.execute(function() {
                return {
                    screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                    screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
                };
            })
                .then(function (res) {
                    cb(null, res);
                })
                .catch(function (err) {
                    cb(err);
                });
        },
        function(res, cb) {
            response.execute.push(res);
            self.screenshot()
                .then(function (screenshotRes) {
                    cb(null, screenshotRes);
                })
                .catch(function (err) {
                    cb(err);
                });
        },
        function(res, cb) {
            response.screenshot = res;

            gm(new Buffer(res.value, 'base64')).crop(
                // width
                response.execute[1].value.screenWidth,
                // height
                response.execute[1].value.screenHeight,
                // top
                response.execute[0].value[0],
                // left
                response.execute[0].value[1]
            ).write(fileName, cb);

        }
    ], function(err) {

        if (err) {
            return defer.reject(err);
        }

        defer.resolve(response);

    });

    return defer.promise;

};
