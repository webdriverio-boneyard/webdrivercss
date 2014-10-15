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
     * if there is no need for image comparison or no images gets saved on fs, just continue
     */
    if(!this.isComparable || !this.self.saveImages) {
        return done();
    }

    /**
     * compare images
     */
    resemble
        .resemble(this.filenamePassed)
        .compareTo(this.filenameFailed)
        .onComplete(done.bind(null,null));

};
