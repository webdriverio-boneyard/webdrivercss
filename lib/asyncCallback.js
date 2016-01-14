'use strict';

/**
 * run workflow again or execute callback function
 */

var endSession = require('./endSession.js');
var Promise = require('bluebird');

module.exports = function(err) {
    var workflow = require('./workflow');
    var ctx = this;

    /**
     * if error occured don't do another shot (if multiple screen width are set)
     */
    /*istanbul ignore next*/
    if (err) return Promise.reject(err);
    return Promise.try(function() {

        /**
         * on multiple screenWidth or multiple page elements
         * repeat workflow
         */
        if(ctx.screenWidth && ctx.screenWidth.length) {

            /**
             * if multiple screen widths are given
             * start workflow all over again with same parameter
             */
            ctx.queuedShots[0].screenWidth = ctx.screenWidth;
            return workflow.call(ctx.self, ctx.pagename, ctx.queuedShots);

        } else if (ctx.queuedShots.length > 1) {

            /**
             * if multiple page modules are given
             */
            return endSession.call(ctx)
            .then(function() {
                ctx.queuedShots.shift();
                return workflow.call(ctx.self, ctx.pagename, ctx.queuedShots, ctx.cb);
            });

        }

        /**
         * finish command
         */
        return endSession.call(ctx)
        .then(function() {
            ctx.self.takeScreenshot = undefined;
            return ctx.self.resultObject;
        })
        .finally(function() {
            ctx.self.resultObject = {};
        });
    });
};
