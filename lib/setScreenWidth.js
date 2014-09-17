/**
 * if multiple screen width are given resize browser dimension
 */

var async = require('async'),
    takenScreenSizes = {};

module.exports = function(done) {

    var that = this;
    this.newScreenSize = {};

    async.waterfall([
        /**
         * get current browser resolution to change back to it
         * after all shots were taken
         */
        function(cb) {
            if(!that.defaultScreenDimension) {
                that.instance.windowHandleSize(function(err,res) {
                    that.defaultScreenDimension = res.value;
                    cb();
                });
            } else {
                cb();
            }
        },
        function(cb) {
            if((that.screenWidth && that.screenWidth.length > 0 && !takenScreenSizes[that.pagename]) ||
               (that.screenWidth && that.screenWidth.length > 0 && takenScreenSizes[that.pagename].indexOf(that.screenWidth[0]) < 0)) {

                /**
                 * set flag to retake screenshot
                 */
                that.takeScreenshot = true;

                /**
                 * resize browser resolution
                 */
                that.instance.call(function() {
                    that.newScreenSize.width = parseInt(that.screenWidth[0], 10);
                    that.newScreenSize.height = parseInt(that.defaultScreenDimension.height, 10);

                    /**
                     * cache already taken screenshot / screenwidth combinations
                     */
                    if(!takenScreenSizes[that.pagename]) {
                        takenScreenSizes[that.pagename] = [that.newScreenSize.width];
                    } else {
                        takenScreenSizes[that.pagename].push(that.newScreenSize.width);
                    }

                    /**
                     * if shot will be taken in a specific screenWidth, rename file and append screen width
                     * value in filename
                     */
                    renameFiles.call(that);

                    that.instance.windowHandleSize({width: that.newScreenSize.width, height: that.newScreenSize.height}, function() {
                        cb();
                    });
                });

            } else if(that.screenWidth.length) {

                /**
                 * if screenshot of this screen width was already taken
                 * rename files and continue
                 */
                renameFiles.call(that);
                cb();

            } else {

                /**
                 * if no screenWidth option was set just continue
                 */
                cb();

            }

        }
    ], done);
};

function renameFiles(that) {
    this.newScreenSize.width = parseInt(this.screenWidth[0], 10);
    this.newScreenSize.height = parseInt(this.defaultScreenDimension.height, 10);
    this.filenamePassed = this.filenamePassed.replace(/\.(passed|failed|diff)\.png/,'.' + this.newScreenSize.width + 'px.$1.png');
    this.filenameFailed = this.filenameFailed.replace(/\.(passed|failed|diff)\.png/,'.' + this.newScreenSize.width + 'px.$1.png');
    this.filenameDiff   = this.filenameDiff.replace(/\.(passed|failed|diff)\.png/,  '.' + this.newScreenSize.width + 'px.$1.png');
    this.screenshot     = this.screenshot.replace(/\.png/, '.' + this.newScreenSize.width + 'px.png')
    this.filename = this.filenameCurrent;
}
