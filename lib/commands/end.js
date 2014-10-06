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
        url: 'https://eyessdk.applitools.com/api/sessions/running/' + this.sessionId,
        method: 'DELETE',
        headers : {
            'Authorization': 'Basic ' + new Buffer(':' + this.key).toString('base64'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        timeout: 5 * 60 * 1000
    }, function(err) {
        if (err) {
            return callback(new webdriverio.ErrorHandler.CommandError('Can\'t end applitools eyes session (' + err.toString() + ')'));
        }

        that._end.call(that.instance, callback);
    });

};
