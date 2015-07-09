'use strict';

/**
 * compare images
 */

var resemble = require('node-resemble-js'),
    q = require('q');

module.exports = function() {
    var defer = q.defer();

    /**
     * if there is no need for image comparison or no images gets saved on fs, just continue
     */
    if(!this.isComparable || !this.self.saveImages) {
        return;
    }

    /**
     * compare images
     */
    resemble(this.baselinePath)
        .compareTo(this.regressionPath)
        .onComplete(function(err, comparedImages) {
            if(err) {
                return defer.reject(err);
            }

            defer.resolve(comparedImages);
        });

    return defer.promise;

};
