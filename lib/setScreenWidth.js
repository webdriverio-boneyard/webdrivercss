/**
 * if multiple screen width are given resize browser dimension
 */

var async = require('async'),
    takenScreenSizes = {};

function renameFiles() {
    this.filenamePassed = this.filenamePassed.replace(/\.(passed|failed|diff)\.png/,'.' + this.newScreenSize.width + 'px.$1.png');
    this.filenameFailed = this.filenameFailed.replace(/\.(passed|failed|diff)\.png/,'.' + this.newScreenSize.width + 'px.$1.png');
    this.filenameDiff   = this.filenameDiff.replace(/\.(passed|failed|diff)\.png/,  '.' + this.newScreenSize.width + 'px.$1.png');
    this.screenshot     = this.screenshot.replace(/\.png/, '.' + this.newScreenSize.width + 'px.png');
    this.filename = this.filenamePassed;
}

module.exports = function(done) {

    var that = this;
    this.newScreenSize = {};

    async.waterfall([
        /**
         * get current browser resolution to change back to it
         * after all shots were taken
         */
        function(cb) {
            if(!that.self.defaultScreenDimension) {
                that.instance.windowHandleSize(function(err,res) {
                    that.self.defaultScreenDimension = res.value;
                    cb();
                });
            } else {
                cb();
            }
        },
        function(cb) {

            if(!that.currentArgs.screenWidth || that.currentArgs.screenWidth.length === 0) {

                /**
                 * if no screenWidth option was set just continue
                 */
                return cb();

            }

            if(that.currentArgs.screenWidth.length && (!takenScreenSizes[that.currentArgs.name] || takenScreenSizes[that.currentArgs.name].indexOf(that.currentArgs.screenWidth[0]) < 0)) {

                /**
                 * set flag to retake screenshot
                 */
                that.takeScreenshot = true;

                /**
                 * resize browser resolution
                 */
                that.instance.call(function() {
                    that.newScreenSize.width = parseInt(that.currentArgs.screenWidth.shift(), 10);
                    that.newScreenSize.height = parseInt(that.self.defaultScreenDimension.height, 10);

                    /**
                     * cache already taken screenshot / screenwidth combinations
                     */
                    if(!takenScreenSizes[that.currentArgs.name]) {
                        takenScreenSizes[that.currentArgs.name] = [that.newScreenSize.width];
                    } else {
                        takenScreenSizes[that.currentArgs.name].push(that.newScreenSize.width);
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

            } else {

                /**
                 * if screenshot of this screen width was already taken
                 * rename files and continue
                 */
                renameFiles.call(that);
                cb();

            }
        }
    ], done);
};
