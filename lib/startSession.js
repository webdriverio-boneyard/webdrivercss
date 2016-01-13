'use strict';

var Promise = require('bluebird');
var pkg = require('../package.json');
var request = Promise.promisify(require('request'), {multiArg: true});
var WebdriverIO = require('webdriverio');

module.exports = function() {

    var ctx = this;
    var done = arguments[arguments.length - 1];

    /**
     * skip when not using applitools
     */
    if(!this.self.usesApplitools || this.self.sessionId) {
        return Promise.resolve().nodeify(done);
    }

    /**
     * get meta information of current session
     */
    return Promise.try(function() {
        /*eslint-disable*/
        ctx.instance.execute(function() {
            return {
                useragent: navigator.userAgent,
                screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                documentHeight: document.documentElement.scrollHeight
            };
        })
        /*eslint-enable*/
        .then(function(res) {
            ctx.useragent = res.value.useragent;
            ctx.displaySize = {
                width: ctx.screenWidth && ctx.screenWidth.length ? ctx.screenWidth[0] : res.value.screenWidth,
                height: res.value.documentHeight
            };
        });
    })
    .then(function initializeApplitools(){
        return request({
            url: ctx.self.host + '/api/sessions/running',
            qs: {apiKey: ctx.applitools.apiKey},
            method: 'POST',
            json: {
                startInfo: {
                    appIdOrName: ctx.applitools.appName,
                    scenarioIdOrName: ctx.currentArgs.name,
                    batchInfo: {
                        id: ctx.applitools.batchId,
                        name: ctx.pagename,
                        startedAt: new Date().toISOString()
                    },
                    environment: {
                        displaySize: ctx.displaySize,
                        inferred: 'useragent:' + ctx.useragent
                    },
                    matchLevel: 'Strict',
                    agentId: pkg.name + '/' + pkg.version
                }
            },
            headers: ctx.self.headers,
            timeout: ctx.self.reqTimeout
        })
        .spread(function(res, body) {
            ctx.self.sessionId = body.id;
            ctx.self.url = body.url;
            ctx.self.isNew = res.statusCode === 201;
        })
        .catch(function() {
            throw new WebdriverIO.ErrorHandler.CommandError('Couldn\'t start applitools session');
        });
    }).nodeify(done);
};
