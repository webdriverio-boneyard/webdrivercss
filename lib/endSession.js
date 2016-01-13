'use strict';

var merge = require('deepmerge');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'), {multiArgs: true});

module.exports = function(done) {

    var that = this;

    return Promise.try(function setOriginalResolution() {
        /**
         * if screenwidth was set, get back to old resolution
         */
        if (!that.self.defaultScreenDimension) return;

        return that.instance.windowHandleSize({
            width: that.self.defaultScreenDimension.width,
            height: that.self.defaultScreenDimension.height
        });
    })
    /**
     * If we have an applitools session open, close it
     */
    .then(function closeApplitools() {
        if (!that.self.usesApplitools) return;

        // Whether or not we should automatically save this test as baseline.
        var updateBaseline = (that.self.isNew && that.applitools.saveNewTests) ||
                             (!that.self.isNew && that.applitools.saveFailedTests);

        return request({
            qs: {apiKey: that.applitools.apiKey, updateBaseline: updateBaseline},
            url: that.self.host + '/api/sessions/running/' + that.self.sessionId,
            method: 'DELETE',
            headers: that.self.headers,
            timeout: that.self.reqTimeout
        });
    })
    .spread(function clearAndStore(res, body) {
        if (!body) return;

        that.self.resultObject[that.currentArgs.name] = merge({
            id: that.self.sessionId,
            url: that.self.url
        }, JSON.parse(body));
        that.self.url = undefined;
        that.self.sessionId = undefined;
        that.self.isNew = undefined;
    }).nodeify(done);
};
