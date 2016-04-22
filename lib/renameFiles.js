'use strict';

var Promise = require('bluebird');
var glob = Promise.promisify(require('glob'));
var fs   = require('fs');
Promise.promisifyAll(fs);

module.exports = function() {
    var ctx = this;

    return glob('{' + ctx.regressionPath + ',' + ctx.baselinePath + '}', {})
    .then(function(files) {

        /**
         * if no files were found continue
         */
        if(files.length === 0) {
            return;
        }

        ctx.isComparable = true;
        ctx.filename = ctx.regressionPath;

        /**
         * rename existing files
         */
        if(files.length === 2 && ctx.updateBaseline && !ctx.self.usesApplitools) {
            return fs.renameAsync(ctx.regressionPath, ctx.baselinePath);
        }

    });
};
