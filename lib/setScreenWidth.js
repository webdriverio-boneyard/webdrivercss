/**
 * if multiple screen width are given resize browser dimension
 */

var async = require('async'),
    takenScreenSizes = {};

function renameFiles() {
    this.baselinePath   = this.baselinePath.replace(/\.(baseline|regression|diff)\.png/,'.' + this.newScreenSize.width + 'px.$1.png');
    this.regressionPath = this.regressionPath.replace(/\.(baseline|regression|diff)\.png/,'.' + this.newScreenSize.width + 'px.$1.png');
    this.diffPath       = this.diffPath.replace(/\.(baseline|regression|diff)\.png/,  '.' + this.newScreenSize.width + 'px.$1.png');
    this.screenshot     = this.screenshot.replace(/\.png/, '.' + this.newScreenSize.width + 'px.png');
    this.filename = this.baselinePath;
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

            if(!that.screenWidth || that.screenWidth.length === 0) {

                /**
                 * if no screenWidth option was set just continue
                 */
                return cb();

            }

            if(that.screenWidth.length && (!takenScreenSizes[that.pagename] || takenScreenSizes[that.pagename].indexOf(that.screenWidth[0]) < 0)) {

                /**
                 * set flag to retake screenshot
                 */
                that.takeScreenshot = true;

                /**
                 * resize browser resolution
                 */
                that.instance.call(function() {
                    that.newScreenSize.width = parseInt(that.screenWidth.shift(), 10);
                    that.newScreenSize.height = parseInt(that.self.defaultScreenDimension.height, 10);

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

                    that.instance.windowHandleSize({width: that.newScreenSize.width, height: that.newScreenSize.height})
                                 /**
                                  * wait until browser got resized before continue
                                  */
                                 .executeAsync(function(screenWidth) {
                                    var cb = arguments[arguments.length - 1],
                                        timeout = null;

                                    function checkScreenWidth(screenWidth) {
                                        if(Math.max(document.documentElement.clientWidth, window.innerWidth || 0) === screenWidth) {
                                            clearTimeout(timeout);
                                            return cb();
                                        }
                                        timeout = setTimeout(checkScreenWidth, 100);
                                    }

                                    checkScreenWidth();
                                 }, that.newScreenSize.width, function() {
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
