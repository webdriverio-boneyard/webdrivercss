var pkg = require('../../package.json'),
    request = require('request'),
    webdriverio = require('webdriverio');

module.exports = function init(appIdOrName, scenarioIdOrName) {

    /*!
     * make sure that callback contains chainit callback
     */
    var that = this,
        callback = arguments[arguments.length - 1];

    if (typeof appIdOrName !== 'string') {
        return callback(new webdriverio.ErrorHandler.CommandError('You need to specify an app ID or name to start an applitools eyes session'));
    }

    if (typeof scenarioIdOrName !== 'string') {
        return callback(new webdriverio.ErrorHandler.CommandError('You need to specify an scenario ID or name to start an applitools eyes session'));
    }

    request({
        url: 'https://eyessdk.applitools.com/api/sessions/running',
        method: 'POST',
        json: {
            'startInfo': {
                'appIdOrName': appIdOrName,
                'scenarioIdOrName': scenarioIdOrName,
                'batchInfo': {
                    'startedAt': '2013-12-05T13:15:30Z'
                },
                'environment': {
                    'displaySize': {
                        'width': 1024,
                        'height': 768
                    }
                },
                'matchLevel': 'Strict',
                'agentId': pkg.name + '/' + pkg.version
            }
        },
        headers : {
            'Authorization': 'Basic ' + new Buffer(':' + this.key).toString('base64'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        timeout: 5 * 60 * 1000
    }, function(err, req, body) {

        if(err) {
            return callback(new webdriverio.ErrorHandler.CommandError('Can\'t initialize applitools eyes session (' + err.toString() + ')'));
        }

        that.sessionId = body.id;
        that.url = body.url;
        that._init.call(that.instance, callback);

    });
};
