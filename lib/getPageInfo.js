'use strict';

/**
 * get page informations
 * IMPORTANT: all of this code gets executed on browser side, so you won't have
 *            access to node specific interfaces at all
 */
var async = require('async'),
    merge = require('deepmerge');

/**
 * little helper function to check against argument values
 * @param  {Object}  variable  some variable
 * @return {Boolean}           is true if typeof variable is number
 */
function isNumber(variable) {
    return typeof variable === 'number';
}

module.exports = function(done) {
    var that = this,
        response = {
            excludeRect: [],
            scrollPos: {x: 0, y:0},
        },
        excludeRect = [],
        element = that.currentArgs.elem;

    async.waterfall([
        /**
         * get page information
         */
        function(cb) {
            that.instance.execute(function() {
                /**
                 * get current scroll position
                 * @return {Object}  x and y coordinates of current scroll position
                 */
                var getScrollPosition = function() {
                    var x = 0,
                        y = 0;

                    if (typeof window.pageYOffset === 'number') {

                        /* Netscape compliant */
                        y = window.pageYOffset;
                        x = window.pageXOffset;

                    } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {

                        /* DOM compliant */
                        y = document.body.scrollTop;
                        x = document.body.scrollLeft;

                    } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {

                        /* IE6 standards compliant mode */
                        y = document.documentElement.scrollTop;
                        x = document.documentElement.scrollLeft;

                    }

                    return {
                        x: x,
                        y: y
                    };
                };

                return {
                    title: document.title,
                    scrollPos: getScrollPosition(),
                    screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                    screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
                };

            }, cb);
        },

        /**
         * get element information
         */
        function(res, cb) {
            response = merge(response, res.value);

            if(!element) {
                return cb(null, {}, {});
            }

            /**
             * needs to get defined that verbose to make it working in IE driver
             */
            that.instance.selectorExecute(element, function(elem) {
                var boundingRect = elem[0].getBoundingClientRect();
                return {
                    elemBounding: {
                        width: boundingRect.width ? boundingRect.width : boundingRect.right - boundingRect.left,
                        height: boundingRect.height ? boundingRect.height : boundingRect.bottom - boundingRect.top,
                        top: boundingRect.top,
                        right: boundingRect.right,
                        bottom: boundingRect.bottom,
                        left: boundingRect.left
                    }
                };
            }, cb);
        },

        /**
         * get information about exclude elements
         */
        function(res, responses, done) {
            response = merge(response, res);

            /**
             * concatenate exclude elements to one dimensional array
             * excludeElements = elements queried by specific selector strategy (typeof string)
             * excludeCoords = x & y coords to exclude custom areas
             */
            var excludeElements = [];

            if (!that.currentArgs.exclude) {
                return done(null, []);
            } else if (!(that.currentArgs.exclude instanceof Array)) {
                that.currentArgs.exclude = [that.currentArgs.exclude];
            }

            that.currentArgs.exclude.forEach(function(excludeElement) {
                if (typeof excludeElement === 'string') {
                    excludeElements.push(excludeElement);
                } else {
                    /**
                     * excludeCoords are a set of x,y rectangle
                     * then just check if the first 4 coords are numbers (minumum to span a rectangle)
                     */
                    if (isNumber(excludeElement.x0) && isNumber(excludeElement.x1) && isNumber(excludeElement.y0) && isNumber(excludeElement.y1)) {
                        response.excludeRect.push(excludeElement);
                    }
                }
            });

            if(excludeElements.length === 0) {
                return done(null, []);
            }

            that.instance.selectorExecute(excludeElements, function() {

                /**
                 * excludeElements are elements queried by specific selenium strategy
                 */
                var excludeElements = Array.prototype.slice.call(arguments),
                    excludeRect = [];

                excludeElements.forEach(function(elements) {

                    if(!elements) {
                        return;
                    }

                    elements.forEach(function(elem) {
                        var elemRect = elem.getBoundingClientRect();
                        excludeRect.push({
                            x0: elemRect.left,
                            y0: elemRect.top,
                            x1: elemRect.right,
                            y1: elemRect.bottom
                        });
                    });
                });

                return excludeRect;

            }, done);
        }
    ], function(err, excludeElements) {

        if(excludeElements && excludeElements.length) {
            response.excludeRect = excludeRect.concat(excludeElements);
        }

        done(err, response);
    });
};
