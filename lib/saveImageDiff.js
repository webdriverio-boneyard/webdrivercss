'use strict';

var fs = require('fs'),
    async = require('async'),
    logWarning = require('./logWarning.js');

module.exports = function(imageDiff,done) {

    var that = this,
        misMatchTolerance = parseFloat(imageDiff.misMatchPercentage,10);

    if(typeof imageDiff === 'function') {
        this.self.resultObject[this.currentArgs.name].push({
            baselinePath: this.baselinePath,
            message: 'first image of module "' + this.currentArgs.name + '" from page "' + this.pagename + '" successfully taken',
            misMatchPercentage: 0,
            isExactSameImage: true,
            isSameDimensions: true,
            isWithinMisMatchTolerance: true,
            properties: this.currentArgs
        });

        return imageDiff();
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

        this.self.resultObject[this.currentArgs.name].push({
            baselinePath: this.baselinePath,
            regressionPath: this.regressionPath,
            diffPath: this.diffPath,
            message: 'mismatch tolerance exceeded (+' + (misMatchTolerance - this.misMatchTolerance) + '), image-diff created',
            misMatchPercentage: misMatchTolerance,
            isExactSameImage: false,
            isSameDimensions: imageDiff.isSameDimensions,
            isWithinMisMatchTolerance: false,
            properties: this.currentArgs
        });

        imageDiff.getDiffImage().pack()
            .on('end', done.bind(null, null, this.resultObject))
            .pipe(fs.createWriteStream(this.diffPath));

    } else {

    /**
     * otherwise delete diff
     */

        async.waterfall([
            /**
             * check if diff shot exists
             */
            function(done) {
                fs.exists(that.diffPath,done.bind(null,null));
            },
            /**
             * remove diff if yes
             */
            function(exists,done) {
                if(exists) {
                    fs.unlink(that.diffPath,done);
                } else {
                    done();
                }
            },
            /**
             * Save a new baseline image, if one doesn't already exist.
             *
             * If one does exist, we delete the temporary regression.
             */
            function(done) {
                fs.exists(that.baselinePath, function(exists) {
                    return !!exists ? fs.unlink(that.regressionPath, done) : fs.rename(that.regressionPath, that.baselinePath, done);
                });
            }
        ], function(err) {

            /**
             * return result object to WebdriverIO instance
             */
            that.self.resultObject[that.currentArgs.name].push({
                baselinePath: that.baselinePath,
                message: 'mismatch tolerance not exceeded (~' + misMatchTolerance + '), baseline didn\'t change',
                misMatchPercentage: misMatchTolerance,
                isExactSameImage: misMatchTolerance === 0,
                isSameDimensions: imageDiff.isSameDimensions,
                isWithinMisMatchTolerance: true
            });

            done(err);

        });

    }
};
