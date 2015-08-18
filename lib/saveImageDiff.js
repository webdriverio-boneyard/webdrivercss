'use strict';

var fs = require('fs'),
    q = require('q'),
    logWarning = require('./logWarning.js');

module.exports = function(imageDiff) {
    console.log('saveImagediff');

    if(!imageDiff) {
        this.self.resultObject[this.currentArgs.name].push({
            baselinePath: this.baselinePath,
            message: 'first image of module "' + this.currentArgs.name + '" from page "' + this.pagename + '" successfully taken',
            misMatchPercentage: 0,
            isExactSameImage: true,
            isSameDimensions: true,
            isWithinMisMatchTolerance: true
        });

        return;
    }

    var that = this,
        defer = q.defer(),
        misMatchTolerance = parseFloat(imageDiff.misMatchPercentage,10);

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
            isWithinMisMatchTolerance: false
        });

        imageDiff.getDiffImage().pack()
            .on('end', function(err) {
                if(err) {
                    return defer.reject(err);
                }

                defer.resolve(that.resultObject);
            })
            .pipe(fs.createWriteStream(this.diffPath));

        return defer.promise;

    }

    /**
     * otherwise delete diff
     */
    return q().then(function() {

        /**
         * check if diff shot exists
         */
        return q.nfcall(fs.exists, that.diffPath);

    }).then(function(exists) {

        /**
         * remove diff if yes
         */
        if(exists) {
            return q.fncall(fs.unlink, that.diffPath);
        }

    }).then(function() {

        /**
         * keep newest screenshot
         */
        return q.fncall(fs.rename, that.regressionPath, that.baselinePath);

    }).then(function() {

        /**
         * return result object to WebdriverIO instance
         */
        that.self.resultObject[that.currentArgs.name].push({
            baselinePath: that.baselinePath,
            message: 'mismatch tolerance not exceeded (~' + misMatchTolerance + '), baseline didn\'t change',
            misMatchPercentage: misMatchTolerance,
            isExactSameImage: misMatchTolerance === 0,
            isSameDimensions: imageDiff.isSameDimensions,
            isWithinMisMatchTolerance: that.misMatchTolerance > misMatchTolerance
        });

    });

};
