'use strict';

var Promise = require('bluebird');
var glob = Promise.promisify(require('glob'));
var fs   = require('fs');

module.exports = function() {
    var done = arguments[arguments.length - 1];
    var that = this;

    return glob('{' + this.regressionPath + ',' + this.baselinePath + '}', {})
    .then(function(files) {

        /**
         * if no files were found continue
         */
        if(files.length === 0) {
            return done();
        }

        that.isComparable = true;
        that.filename = that.regressionPath;

        /**
         * rename existing files
         */
        if(files.length === 2 && that.updateBaseline && !that.self.usesApplitools) {
            return fs.rename(that.regressionPath, that.baselinePath, done);
        } else {
            return done();
        }

    }).nodeify(done);
};
