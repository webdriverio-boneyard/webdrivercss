/**
 * if multiple screen width are given resize browser dimension
 */

module.exports = function(done) {

    var that = this;

    if(this.screenWidth && this.screenWidth.length > 0) {

        /**
         * get current browser resolution to change back to it
         * after all shots were taken
         */
        if(!this.defaultScreenDimension) {
            this.instance.windowHandleSize(function(err,res) {
                that.defaultScreenDimension = res.value;
            });
        }

        this.newScreenSize = {};

        /**
         * resize browser resolution
         */
        this.instance.call(function() {
            that.newScreenSize.width = parseInt(that.screenWidth.pop(), 10);
            that.newScreenSize.height = parseInt(that.defaultScreenDimension.height, 10);

            /**
             * if shot will be taken in a specific screenWidth, rename file and append screen width
             * value in filename
             */
            if(that.newScreenSize) {
                that.filenameCurrent = that.filenameCurrent.replace(/\.(current|new|diff)\.png/,'.$1.' + that.newScreenSize.width + 'px.png');
                that.filenameNew = that.filenameNew.replace(/\.(current|new|diff)\.png/,'.$1.' + that.newScreenSize.width + 'px.png');
                that.filenameDiff = that.filenameDiff.replace(/\.(current|new|diff)\.png/,'.$1.' + that.newScreenSize.width + 'px.png');
                that.filename = that.filenameCurrent;
            }

            that.instance.windowHandleSize({width: that.newScreenSize.width, height: that.newScreenSize.height}, function() {
                done();
            });
        });

    } else {

        /**
         * if no screenWidth option was set just continue
         */
        done();

    }

};