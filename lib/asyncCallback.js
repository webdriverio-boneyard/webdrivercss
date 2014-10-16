/**
 * run workflow again or execute callback function
 */

var workflow = require('./workflow.js');

module.exports = function(err,res) {

    var that = this;

    /**
     * if error occured don't do another shot (if multiple screen width are set)
     */
    /*istanbul ignore next*/
    if(err) {
        return this.cb(err);
    }

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
         * crop next image
         */
        this.queuedShots.shift();
        return workflow.call(this.self, this.pagename, this.queuedShots, this.cb);

    } else if (this.defaultScreenDimension) {

        /**
         * when all shots have been made, get back to old resolution
         */
        return this.instance.windowHandleSize({
            width: this.defaultScreenDimension.width,
            height: this.defaultScreenDimension.height
        }, function(err) {
            that.cb(err,res);
        });

    }

    this.cb(err,res);

};
