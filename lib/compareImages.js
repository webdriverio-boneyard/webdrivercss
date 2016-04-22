'use strict';

/**
 * compare images
 */

var resemble = require('node-resemble-js');
var Promise = require('bluebird');

module.exports = function() {

    var ctx = this;

    return Promise.try(function() {
        /**
         * if there is no need for image comparison or no images gets saved on fs, just continue
         */
        if(!ctx.isComparable || !ctx.self.saveImages) {
            return;
        }

        /**
         * compare images
         */
        var diff = resemble(ctx.baselinePath).compareTo(ctx.regressionPath);

        /**
         * map 'ignore' configuration to resemble options
         */
        var ignore = ctx.currentArgs.ignore || "";
        if (ignore.indexOf("color") === 0) {
            diff.ignoreColors();
        } else if (ignore.indexOf("antialias") === 0) {
            diff.ignoreAntialiasing();
        }

        /**
         * execute the comparison
         */
        return new Promise(function(resolve, reject) {
            diff.onComplete(function(res) { // this callback has bad arity
                resolve(res);
            });
        });
    });
};
