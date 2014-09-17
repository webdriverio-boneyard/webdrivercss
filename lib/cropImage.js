/**
 * crop image according to user arguments and its position on screen and save it
 */

var gm = require('gm'),
    exclude = require('./exclude.js'),
    logWarning = require('./logWarning.js');

module.exports = function(res, done) {

    var excludeRect = res.value ? res.value.excludeRect : /*istanbul ignore next*/ [],
        shot = gm(this.screenshot).quality(100),
        cropDim;

    /**
     * crop image with given arguments
     */
    if(this.currentArgs.x && this.currentArgs.y && this.currentArgs.width && this.currentArgs.height) {

        cropDim = {
            x:      this.currentArgs.x - res.value.scrollPos.x,
            y:      this.currentArgs.y - res.value.scrollPos.y,
            width:  this.currentArgs.width,
            height: this.currentArgs.height
        };

        exclude(shot,excludeRect);
        shot.crop(cropDim.width, cropDim.height, cropDim.x, cropDim.y);

    /**
     * or use boundary of specific CSS element
     */
    } else if(res.value && res.value.elemBounding) {

        cropDim = {
            x:      res.value.elemBounding.left + (res.value.elemBounding.width  / 2),
            y:      res.value.elemBounding.top  + (res.value.elemBounding.height / 2),
            width:  typeof this.currentArgs.width  !== 'undefined' ? this.currentArgs.width  : res.value.elemBounding.width,
            height: typeof this.currentArgs.height !== 'undefined' ? this.currentArgs.height : res.value.elemBounding.height
        };

        exclude(shot,excludeRect);
        shot.crop(cropDim.width, cropDim.height, cropDim.x - (cropDim.width / 2), cropDim.y - (cropDim.height / 2));

    } else {

    /**
     * else save whole screenshot
     *      print warning message
     */

        logWarning.call(this.instance, this.currentArgs.elem ? /*istanbul ignore next*/ 'NoElementFound' : 'ArgumentsMailformed');
        exclude(shot,excludeRect);

    }

    shot.write(this.filename || this.filenamePassed, done.bind(null, null));

};
