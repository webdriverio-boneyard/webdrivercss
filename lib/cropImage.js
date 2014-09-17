/**
 * crop image according to user arguments and its position on screen and save it
 */

var gm = require('gm'),
    exclude = require('./exclude.js'),
    logWarning = require('./logWarning.js');

module.exports = function(res, done) {

    var excludeRect = res.excludeRect,
        shot = gm(this.screenshot).quality(100),
        cropDim;

    if(this.currentArgs.x && this.currentArgs.y && this.currentArgs.width && this.currentArgs.height) {

        /**
         * crop image with given arguments
         */
        cropDim = {
            x:      this.currentArgs.x - res.scrollPos.x,
            y:      this.currentArgs.y - res.scrollPos.y,
            width:  this.currentArgs.width,
            height: this.currentArgs.height
        };

        exclude(shot,excludeRect);
        shot.crop(cropDim.width, cropDim.height, cropDim.x, cropDim.y);

    } else if(res && res.elemBounding) {

        /**
         * or use boundary of specific CSS element
         */
        cropDim = {
            x:      res.elemBounding.left + (res.elemBounding.width  / 2),
            y:      res.elemBounding.top  + (res.elemBounding.height / 2),
            width:  typeof this.currentArgs.width  !== 'undefined' ? this.currentArgs.width  : res.elemBounding.width,
            height: typeof this.currentArgs.height !== 'undefined' ? this.currentArgs.height : res.elemBounding.height
        };

        exclude(shot,excludeRect);
        shot.crop(cropDim.width, cropDim.height, cropDim.x - (cropDim.width / 2), cropDim.y - (cropDim.height / 2));

    } else {

        /**
         * else save whole screenshot and print warning message
         */
        logWarning.call(this.instance, this.currentArgs.elem ? /*istanbul ignore next*/ 'NoElementFound' : 'ArgumentsMailformed');
        exclude(shot,excludeRect);

    }

    shot.write(this.filename || this.filenamePassed, done.bind(null, null));

};
