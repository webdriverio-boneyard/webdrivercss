var request = require('request');

module.exports = function end(tag, ignoreMismatch, callback) {

    if(typeof tag !== 'string') {
        tag = '';
    }

    if(typeof ignoreMismatch !== 'boolean') {
        ignoreMismatch = false;
    }

    /*!
     * make sure that callback contains chainit callback
     */
    var that = this;

    request({
        url: this.host + '/api/sessions/running/' + this.sessionId,
        method: 'DELETE',
        headers : this.headers,
        timeout: this.reqTimeout
    }, function(err, res, body) {
        that._end.call(that.instance, callback.call(that.instance, err, body, res));
    });

};
