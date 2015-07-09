'use strict';

var q = require('q'),
    merge = require('deepmerge'),
    request = require('request');

module.exports = function() {

    var that = this;

    return q().then(function() {

        /**
         * if screenwidth was set, get back to old resolution
         */
        if (!that.self.defaultScreenDimension) {
            return;
        }

        return that.instance.windowHandleSize({
            width: that.self.defaultScreenDimension.width,
            height: that.self.defaultScreenDimension.height
        });

    }).then(function() {

        /**
         * end session when using applitools
         */
        if(!that.self.usesApplitools) {
            return;
        }

        // Whether or not we should automatically save this test as baseline.
        var defer = q.defer(),
            updateBaseline = (that.self.isNew && that.applitools.saveNewTests) ||
                             (!that.self.isNew && that.applitools.saveFailedTests);

        return q.fncall(request, {
            qs: {apiKey: that.applitools.apiKey, updateBaseline: updateBaseline},
            url: that.self.host + '/api/sessions/running/' + that.self.sessionId,
            method: 'DELETE',
            headers: that.self.headers,
            timeout: that.self.reqTimeout
        });
    },
    /**
     * clear session, store result
     */
    function(res, body) {
        var cb = arguments[arguments.length - 1];

        if(body) {
            that.self.resultObject[that.currentArgs.name] = merge({
                id: that.self.sessionId,
                url: that.self.url
            }, JSON.parse(body));
            that.self.url = undefined;
            that.self.sessionId = undefined;
            that.self.isNew = undefined;
        }
        return cb();
    }

    ], function(err) {
        return done(err);
    });
};
