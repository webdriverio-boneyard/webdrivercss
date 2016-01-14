'use strict';

var Promise = require('bluebird');
var fs = require('fs');
Promise.promisifyAll(fs);
var logWarning = require('./logWarning.js');
var streamToPromise = require('./util/streamToPromise');

module.exports = function(imageDiff) {

    var ctx = this;

    return Promise.try(function() {
        if(!imageDiff) {
            ctx.self.resultObject[ctx.currentArgs.name].push({
                baselinePath: ctx.baselinePath,
                message: 'first image of module "' + ctx.currentArgs.name + '" from page "' + ctx.pagename + '" successfully taken',
                misMatchPercentage: 0,
                isExactSameImage: true,
                isSameDimensions: true,
                isWithinMisMatchTolerance: true,
                properties: ctx.currentArgs
            });

            return;
        }

        /**
         * if set misMatchTolerance is smaller then compared misMatchTolerance
         * make image diff
         */
        var misMatchTolerance = parseFloat(imageDiff.misMatchPercentage,10);
        if(ctx.misMatchTolerance < misMatchTolerance) {

            /*istanbul ignore next*/
            if(!imageDiff.isSameDimensions) {
                logWarning.call(ctx.instance, 'DimensionWarning');
            }

            ctx.self.resultObject[ctx.currentArgs.name].push({
                baselinePath: ctx.baselinePath,
                regressionPath: ctx.regressionPath,
                diffPath: ctx.diffPath,
                message: 'mismatch tolerance exceeded (+' + (misMatchTolerance - ctx.misMatchTolerance) + '), image-diff created',
                misMatchPercentage: misMatchTolerance,
                isExactSameImage: false,
                isSameDimensions: imageDiff.isSameDimensions,
                isWithinMisMatchTolerance: false,
                properties: ctx.currentArgs
            });


            var stream = imageDiff.getDiffImage();
            imageDiff.getDiffImage().pack().pipe(fs.createWriteStream(ctx.diffPath));
            return streamToPromise(stream);
        }

        /**
         * otherwise delete diff
         */
        else {
            /**
             * check if diff shot exists
             */
            return fs.unlinkAsync(ctx.diffPath)
            .catch(function(ignoredErr) {
                return; // ignore
            })
            /**
             * Save a new baseline image, if one doesn't already exist.
             *
             * If one does exist, we delete the temporary regression.
             */
            .then(function saveNewBaseline() {
                return fs.statAsync(ctx.baselinePath)
                .then(function(exists) {
                    return fs.unlinkAsync(ctx.regressionPath);
                })
                .catch(function(e) {
                    return fs.renameAsync(ctx.regressionPath, ctx.baselinePath);
                });
            })
            .then(function setResults() {
                /**
                 * return result object to WebdriverIO instance
                 */
                ctx.self.resultObject[ctx.currentArgs.name].push({
                    baselinePath: ctx.baselinePath,
                    message: 'mismatch tolerance not exceeded (~' + misMatchTolerance + '), baseline didn\'t change',
                    misMatchPercentage: misMatchTolerance,
                    isExactSameImage: misMatchTolerance === 0,
                    isSameDimensions: imageDiff.isSameDimensions,
                    isWithinMisMatchTolerance: true
                });
            });
        }
    })

};
