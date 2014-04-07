/**
 * run workflow again or execute callback function
 */

var workflow = require('./workflow.js');

module.exports = function(err,res) {

    var that = this;

    /**
     * if error occured don't do another shot (if multiple screen width are set)
     */
    //#JSCOVERAGE_IF 0
    if(err) {
        return this.cb(err);
    }
    //#JSCOVERAGE_ENDIF

    /**
     * if multiple screen width are set
     */
    if(this.screenWidth) {

        /**
         * start workflow all over again with same parameter
         */
        if(this.screenWidth.length > 0) {
            return workflow.call(this, this.instance, this.id, this.args, this.cb);
        }

        /**
         * when all shots have been made, get back to old resolution
         */
        this.instance.windowHandleSize({
            width: this.defaultScreenDimension.width,
            height: this.defaultScreenDimension.height
        }, function(err) {
            //#JSCOVERAGE_IF 0
            that.cb(err,res);
            //#JSCOVERAGE_ENDIF
        });

    } else {
        this.cb(err,res);
    }

};