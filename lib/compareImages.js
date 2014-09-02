/**
 * compare images
 */

var resemble = require('resemble');

module.exports = function() {

    /**
     * need to find done function because gm doesn't have node like callbacks (err,res)
     */
    var done = arguments[arguments.length - 1];

    /**
     * if there is no need for image comparison, just continue
     */
    if(!this.isComparable) {
        return done();
    }

    /**
     * compare images
     */
    resemble
        .resemble(this.filenameCurrent)
        .compareTo(this.filenameNew)
        .onComplete(done.bind(null,null));

};
