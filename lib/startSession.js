'use strict';

var pkg = require('../package.json'),
    request = require('request'),
    q = require('q');

module.exports = function() {

    var that = this;

    /**
     * skip when not using applitools
     */
    if(!this.self.usesApplitools || this.self.sessionId) {
        return;
    }

    /**
     * get meta information of current session
     */
    return this.instance.execute(function() {
        return {
            useragent: navigator.userAgent,
            screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            documentHeight: document.documentElement.scrollHeight
        };
    }).then(function(err, res) {
        var defer = q.defer();

        that.useragent = res.value.useragent;
        that.displaySize = {
            width: that.screenWidth && that.screenWidth.length ? that.screenWidth[0] : res.value.screenWidth,
            height: res.value.documentHeight
        };

        request({
            url: that.self.host + '/api/sessions/running',
            qs: {apiKey: that.applitools.apiKey},
            method: 'POST',
            json: {
                'startInfo': {
                    'appIdOrName': that.applitools.appName,
                    'scenarioIdOrName': that.currentArgs.name,
                    'batchInfo': {
                        'id': that.applitools.batchId,
                        'name': that.pagename,
                        'startedAt': new Date().toISOString()
                    },
                    'environment': {
                        'displaySize': that.displaySize,
                        'inferred': 'useragent:' + that.useragent
                    },
                    'matchLevel': 'Strict',
                    'agentId': pkg.name + '/' + pkg.version
                }
            },
            headers: that.self.headers,
            timeout: that.self.reqTimeout
        }, function(err, res, body) {
            if(err) {
                defer.reject(err);
            }

            defer.resolve({
                res: res,
                body: body
            });
        });

        return defer.promise;

    }).then(function(result) {
        that.self.sessionId = result.body.id;
        that.self.url = result.body.url;
        that.self.isNew = result.res.statusCode === 201;
    });
};
