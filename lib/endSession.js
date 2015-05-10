'use strict';

var async = require('async'),
    merge = require('deepmerge'),
    request = require('request');

module.exports = function(done) {

    var that = this;

    async.waterfall([
        /**
         * if screenwidth was set, get back to old resolution
         */
        function(cb) {
            if (!that.self.defaultScreenDimension) {
                return cb();
            }

            that.instance.windowHandleSize({
                width: that.self.defaultScreenDimension.width,
                height: that.self.defaultScreenDimension.height
            }, cb);
        },
        /**
         * end session when using applitools
         */
        function() {
            var cb = arguments[arguments.length - 1];

            if(!that.self.usesApplitools) {
                return cb();
            }

            // Whether or not we should automatically save this test as baseline.
            var updateBaseline = (that.self.isNew && that.applitools.saveNewTests) ||
                                 (!that.self.isNew && that.applitools.saveFailedTests);

            return request({
                qs: {apiKey: that.applitools.apiKey, updateBaseline: updateBaseline},
                url: that.self.host + '/api/sessions/running/' + that.self.sessionId,
                method: 'DELETE',
                headers: that.self.headers,
                timeout: that.self.reqTimeout
            }, cb);
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
