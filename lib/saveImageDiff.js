var gm = require('gm'),
    fs = require('fs'),
    async = require('async'),
    logWarning = require('./logWarning.js');

module.exports = function(imageDiff,done) {

    var that = this,
        resultObject = {},
        misMatchTolerance = parseFloat(imageDiff.misMatchPercentage,10);

    if(typeof imageDiff === 'function') {
        resultObject = {
            message: 'first image with id "' + this.id + '" successfully taken',
            isSameDimensions: true,
            misMatchPercentage: 0
        };

        return imageDiff(null, resultObject);
    }

    /**
     * if set misMatchTolerance is smaller then compared misMatchTolerance
     * make image diff
     */
    if(this.misMatchTolerance < misMatchTolerance) {

        /*istanbul ignore next*/
        if(!imageDiff.isSameDimensions) {
            logWarning.call(this.instance, 'DimensionWarning');
        }

        resultObject = {
            message: 'mismatch tolerance exceeded (+' + (misMatchTolerance - this.misMatchTolerance) + '), image-diff created',
            misMatchPercentage: misMatchTolerance,
            isSameDimensions: imageDiff.isSameDimensions
        };

        var diff = new Buffer(imageDiff.getImageDataUrl().replace(/data:image\/png;base64,/,''), 'base64');
        gm(diff).quality(100).write(this.filenameDiff, done.bind(null,null,resultObject));

    } else {

    /**
     * otherwise delete diff
     */

        async.waterfall([
            /**
             * check if diff shot exists
             */
            function(done) {
                fs.exists(that.filenameDiff,done.bind(null,null));
            },
            /**
             * remove diff if yes
             */
            function(exists,done) {
                if(exists) {
                    fs.unlink(that.filenameDiff,done);
                } else {
                    done();
                }
            },
            /**
             * keep newest screenshot
             */
            function(done) {
                fs.rename(that.filenameNew, that.filenameCurrent, done);
            }
        ], function(err) {

            /**
             * return result object to WebdriverIO instance
             */
            resultObject = {
                message: 'mismatch tolerance not exceeded (~' + misMatchTolerance + '), removed old screenshot',
                misMatchPercentage: misMatchTolerance,
                isSameDimensions: imageDiff.isSameDimensions
            };

            done(err, resultObject);

        });

    }
};
