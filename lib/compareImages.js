'use strict';

/**
 * compare images
 */

var resemble = require('node-resemble-js');

module.exports = function() {

    /**
     * need to find done function because gm doesn't have node like callbacks (err,res)
     */
    var done = arguments[arguments.length - 1];

    return Promise.try(function() {
        /**
         * if there is no need for image comparison or no images gets saved on fs, just continue
         */
        if(!this.isComparable || !this.self.saveImages) {
            return;
        }

        /**
         * compare images
         */
        var diff = resemble(this.baselinePath).compareTo(this.regressionPath);

        /**
         * map 'ignore' configuration to resemble options
         */
        var ignore = this.currentArgs.ignore || "";
        if (ignore.indexOf("color") === 0) {
            diff.ignoreColors();
        } else if (ignore.indexOf("antialias") === 0) {
            diff.ignoreAntialiasing();
        }

        /**
         * execute the comparison
         */
        return Promise.fromCallback(function(cb) {
            diff.onComplete(cb.bind(null,null));
        });
    })
    .nodeify(done);
};
