/**
 * wait a certain amount of time to load things properly
 */

module.exports = function(done) {
    
    if(!this.args.timeout || typeof this.args.timeout !== 'number') {
        return done();
    }
    
    this.instance.pause(this.args.timeout).call(done);

};