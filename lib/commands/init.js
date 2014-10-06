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
        url: this.host + '/api/sessions/running',
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
        headers: this.headers,
        timeout: this.reqTimeout
    }, function(err, res, body) {

        if (res.statusCode !== 200 && res.statusCode !== 201) {
            return callback(new webdriverio.ErrorHandler.CommandError('Couldn\'t start applitools session'));
        }

        that.sessionId = body.id;
        that.url = body.url;
        that._init.call(that.instance, callback.bind(that.instance, err, body, res));
    });
};
