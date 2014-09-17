var glob = require('glob'),
    fs   = require('fs');

module.exports = function() {
    var done = arguments[arguments.length - 1];

    glob('{' + this.filenameFailed + ',' + this.filenamePassed + '}', {}, function(err,files) {

        /**
         * if no files were found continue
         */
        if(files.length === 0) {
            return done();
        }

        this.isComparable = true;
        this.filename = this.filenameFailed;

        /**
         * rename existing files
         */
        if(files.length === 2) {
            return fs.rename(this.filenameFailed, this.filenamePassed, done);
        } else {
            return done();
        }

    }.bind(this));
};
