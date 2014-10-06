var util = require('util'),
    request = require('request'),
    webdriverio = require('webdriverio');

module.exports = function end(tag, ignoreMismatch) {

    if(typeof tag !== 'string') {
        tag = '';
    }

    if(typeof ignoreMismatch !== 'boolean') {
        ignoreMismatch = false;
    }

    /*!
     * make sure that callback contains chainit callback
     */
    var that = this,
        callback = arguments[arguments.length - 1];

    request({
        url: this.host + '/api/sessions/running/' + this.sessionId,
        method: 'DELETE',
        headers : this.headers,
        timeout: this.reqTimeout
    }, function(err) {
        if (err) {
            return callback(new webdriverio.ErrorHandler.CommandError('Can\'t end applitools eyes session (' + err.toString() + ')'));
        }

        that._end.call(that.instance, callback);
    });

};
