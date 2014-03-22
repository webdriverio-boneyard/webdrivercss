/**
 * compare images
 */

var resemble = require('resemble');

module.exports = function() {

    /**
     * need to find done function because gm doesn't have node like callbackes (err,res)
     */
    var params = Array.prototype.slice.call(arguments),
        done = params[params.length - 1];

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