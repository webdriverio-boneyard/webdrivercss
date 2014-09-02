var glob = require('glob'),
    fs   = require('fs');

module.exports = function() {
    var done = arguments[arguments.length - 1];

    glob('{' + this.filenameCurrent + ',' + this.filenameNew + '}', {}, function(err,files) {

        /**
         * if no files were found continue
         */
        if(files.length === 0) {
            return done();
        }

        this.isComparable = true;
        this.filename = this.filenameNew;

        /**
         * rename existing files
         */
        if(files.length === 2) {
            return fs.rename(this.filenameNew, this.filenameCurrent, done);
        } else {
            return done();
        }

    }.bind(this));
};
