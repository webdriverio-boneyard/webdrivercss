'use strict';

var merge = require('deepmerge');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'), {multiArgs: true});

module.exports = function() {

    var ctx = this;

    return Promise.try(function setOriginalResolution() {
        /**
         * if screenwidth was set, get back to old resolution
         */
        if (!ctx.self.defaultScreenDimension) return;

        return ctx.instance.windowHandleSize({
            width: ctx.self.defaultScreenDimension.width,
            height: ctx.self.defaultScreenDimension.height
        });
    })
    /**
     * If we have an applitools session open, close it
     */
    .then(function closeApplitools() {
        if (!ctx.self.usesApplitools) return;

        // Whether or not we should automatically save this test as baseline.
        var updateBaseline = (ctx.self.isNew && ctx.applitools.saveNewTests) ||
                             (!ctx.self.isNew && ctx.applitools.saveFailedTests);

        return request({
            qs: {apiKey: ctx.applitools.apiKey, updateBaseline: updateBaseline},
            url: ctx.self.host + '/api/sessions/running/' + ctx.self.sessionId,
            method: 'DELETE',
            headers: ctx.self.headers,
            timeout: ctx.self.reqTimeout
        })
        .spread(function clearAndStore(res, body) {
            if (!body) return;

            ctx.self.resultObject[ctx.currentArgs.name] = merge({
                id: ctx.self.sessionId,
                url: ctx.self.url
            }, JSON.parse(body));
            ctx.self.url = undefined;
            ctx.self.sessionId = undefined;
            ctx.self.isNew = undefined;
        });
    });
};
