'use strict';

var glob = require('glob'),
    fs   = require('fs'),
    q    = require('q');

module.exports = function() {
    console.log('renameFiles');
    var defer = q.defer();

    glob('{' + this.regressionPath + ',' + this.baselinePath + '}', {}, function(err,files) {

        if(err) {
            defer.reject(err);
        }

        /**
         * if no files were found continue
         */
        if(files.length === 0) {
            return defer.resolve();
        }

        this.isComparable = true;
        this.filename = this.regressionPath;

        /**
         * rename existing files
         */
        if(files.length === 2 && this.updateBaseline && !this.self.usesApplitools) {
            return fs.rename(this.regressionPath, this.baselinePath, defer.resolve.bind(defer));
        } else {
            return defer.resolve();
        }

    }.bind(this));

    return defer.promise;
};
