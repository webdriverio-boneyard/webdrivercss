'use strict';

/**
 * crop image according to user arguments and its position on screen and save it
 */

var Promise = require('bluebird');
var gm = require('gm');
Promise.promisifyAll(gm.prototype);
var request = Promise.promisify(require('request'), {multiArg: true});
var exclude = require('./exclude.js');

module.exports = function(res, done) {

    var ctx = this;
    var excludeRect = res.excludeRect;
    var shot = gm(this.screenshot).quality(100);
    var cropDim;

    return Promise.try(function() {

        var x = parseInt(this.currentArgs.x, 10);
        var y = parseInt(this.currentArgs.y, 10);
        var width = parseInt(this.currentArgs.width, 10);
        var height = parseInt(this.currentArgs.height, 10);

        if (!isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {

            /**
             * crop image with given arguments
             */
            cropDim = {
                x: x - res.scrollPos.x,
                y: y - res.scrollPos.y,
                width: width,
                height: height
            };

            exclude(shot, excludeRect);
            shot.crop(cropDim.width, cropDim.height, cropDim.x, cropDim.y);

        } else if (res && res.elemBounding) {

            /**
             * or use boundary of specific CSS element
             */
            cropDim = {
                x: res.elemBounding.left + (res.elemBounding.width / 2),
                y: res.elemBounding.top + (res.elemBounding.height / 2),
                width: isNaN(width) ? res.elemBounding.width : width,
                height: isNaN(height) ? res.elemBounding.height : height
            };

            exclude(shot, excludeRect);
            shot.crop(cropDim.width, cropDim.height, cropDim.x - (cropDim.width / 2), cropDim.y - (cropDim.height / 2));

        } else {
            exclude(shot, excludeRect);
        }
    })
    .then(function() {
        if (!ctx.self.saveImages) return;

        /**
         * save image to fs
         */
        return shot.writeAsync(ctx.filename || ctx.baselinePath)
        .then(function() {
            /**
             * generate image buffer
             */
            return shot.toBufferAsync('PNG');
        })
        /**
         * upload image to applitools
         */
        .then(function(buffer) {
            if (!ctx.self.usesApplitools) return;
            return request({
                qs: {apiKey: ctx.applitools.apiKey},
                url: ctx.self.host + '/api/sessions/running/' + ctx.self.sessionId,
                method: 'POST',
                headers: ctx.self.headers,
                timeout: ctx.self.reqTimeout,
                json: {
                    'appOutput': {
                        'title': res.title,
                        'screenshot64': new Buffer(buffer).toString('base64')
                    },
                    'tag': ctx.currentArgs.tag || '',
                    'ignoreMismatch': ctx.currentArgs.ignoreMismatch || false
                }
            });
        });
    }).nodeify(done);
};
