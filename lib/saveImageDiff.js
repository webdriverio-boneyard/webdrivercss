'use strict';

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var logWarning = require('./logWarning.js');

module.exports = function(imageDiff,done) {

    var that = this;
    var misMatchTolerance = parseFloat(imageDiff.misMatchPercentage,10);

    return Promise.try(function() {
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

        }

        /**
         * otherwise delete diff
         */
        else {

            /**
             * check if diff shot exists
             */
            return Promise.try(function checkDiffShot() {
                return fs.existsAsync(that.diffPath);
            })
            /**
             * remove diff if yes
             */
            .then(function unlinkIfExists(exists) {
                if (exists) return fs.unlinkAsync(that.diffPath);
            })
            /**
             * Save a new baseline image, if one doesn't already exist.
             *
             * If one does exist, we delete the temporary regression.
             */
            .then(function saveNewBaseline() {
                return fs.existsAsync(that.baselinePath)
                .then(function(exists) {
                    return exists ?
                        fs.unlinkAsync(that.regressionPath) :
                        fs.renameAsync(that.regressionPath, that.baselinePath);
                });
            })
            .then(function setResults() {
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
            });
        }
    }).nodeify(done);

};
