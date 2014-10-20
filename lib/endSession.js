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
            if (!that.defaultScreenDimension) {
                return cb();
            }

            that.instance.windowHandleSize({
                width: that.defaultScreenDimension.width,
                height: that.defaultScreenDimension.height
            }, cb);
        },
        /**
         * end session when using applitools
         */
        function(cb) {
            var cb = arguments[arguments.length - 1];

            if(!that.self.usesApplitools) {
                return cb();
            }

            return request({
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
            }                
            return cb();
        }

    ], function(err, res, body) {
        return done(err);
    });
};
