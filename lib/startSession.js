'use strict';

var pkg = require('../package.json');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
Promise.promisifyAll(request);
var WebdriverIO = require('webdriverio');

module.exports = function() {

    var ctx = this;

    return Promise.try(function() {
        /**
         * skip when not using applitools
         */
        if(!ctx.self.usesApplitools || ctx.self.sessionId) {
            return;
        }

        return Promise.resolve(ctx.instance.execute(getNavigator))
        .then(function(res) {
            ctx.useragent = res.value.useragent;
            ctx.displaySize = {
                width: ctx.screenWidth && ctx.screenWidth.length ? ctx.screenWidth[0] : res.value.screenWidth,
                height: res.value.documentHeight
            };
        })
        .then(function() {
            return request({
                url: ctx.self.host + '/api/sessions/running',
                qs: {apiKey: ctx.applitools.apiKey},
                method: 'POST',
                json: {
                    'startInfo': {
                        'appIdOrName': ctx.applitools.appName,
                        'scenarioIdOrName': ctx.currentArgs.name,
                        'batchInfo': {
                            'id': ctx.applitools.batchId,
                            'name': ctx.pagename,
                            'startedAt': new Date().toISOString()
                        },
                        'environment': {
                            'displaySize': ctx.displaySize,
                            'inferred': 'useragent:' + ctx.useragent
                        },
                        'matchLevel': 'Strict',
                        'agentId': pkg.name + '/' + pkg.version
                    }
                },
                headers: ctx.self.headers,
                timeout: ctx.self.reqTimeout
            });
        })
        .then(function(res) {
            if (res.statusCode !== 200 && res.statusCode !== 201) {
                throw new Error();
            }
            var body = res.body;

            ctx.self.sessionId = body.id;
            ctx.self.url = body.url;
            ctx.self.isNew = res.statusCode === 201;
        })
        .catch(function(err) {
            throw new WebdriverIO.ErrorHandler.CommandError('Couldn\'t start applitools session: ' + err.stack);
        });
    });
};

/*eslint-disable*/
function getNavigator() {
    return {
        useragent: navigator.userAgent,
        screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        documentHeight: document.documentElement.scrollHeight
    };
}
/*eslint-enable*/
