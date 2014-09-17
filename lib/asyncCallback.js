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

    if (this.queuedShots.length > 0) {

        /**
         * if multiple page modules are given
         * crop next image
         */
        return workflow.call(this.self, this.pagename, this.args, this.queuedShots, this.cb);

    } else if(this.screenWidth) {

        /**
         * if multiple screen widths are given
         * start workflow all over again with same parameter
         */
        if(this.screenWidth.length > 0) {
            this.screenWidth.shift();
            return workflow.call(this.self, this.pagename, this.args, JSON.parse(JSON.stringify(this.args)), this.cb);
        }

        /**
         * when all shots have been made, get back to old resolution
         */
        this.instance.windowHandleSize({
            width: this.defaultScreenDimension.width,
            height: this.defaultScreenDimension.height
        }, function(err) {
            that.cb(err,res);
        });

    } else {

        this.cb(err,res);

    }

};
