'use strict';

/**
 * run workflow again or execute callback function
 */

var workflow = require('./workflow.js'),
    endSession = require('./endSession.js');

module.exports = function(err) {

    var that = this;

    /**
     * if error occured don't do another shot (if multiple screen width are set)
     */
    /*istanbul ignore next*/
    if(err) {
        return this.cb(err);
    }

    /**
     * on multiple screenWidth or multiple page elements
     * repeat workflow
     */
    if(this.screenWidth && this.screenWidth.length) {

        /**
         * if multiple screen widths are given
         * start workflow all over again with same parameter
         */
        this.queuedShots[0].screenWidth = this.screenWidth;
        return workflow.call(this.self, this.pagename, this.queuedShots, this.cb);

    } else if (this.queuedShots.length > 1) {

        /**
         * if multiple page modules are given
         */
        return endSession.call(this, function() {
            that.queuedShots.shift();
            return workflow.call(that.self, that.pagename, that.queuedShots, that.cb);
        });

    }

    /**
     * finish command
     */
    return endSession.call(this, function(err) {
        that.self.takeScreenshot = undefined;
        that.cb(err, that.self.resultObject);
        that.self.resultObject = {};
    });

};
