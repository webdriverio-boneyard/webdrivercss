'use strict';

/**
 * crop image according to user arguments and its position on screen and save it
 */

var gm = require('gm'),
    q = require('q'),
    request = require('request'),
    exclude = require('./exclude.js');

module.exports = function(res) {

    var that = this,
        excludeRect = res.excludeRect,
        shot = gm(this.screenshot).quality(100),
        cropDim;

    if (this.currentArgs.x && this.currentArgs.y && this.currentArgs.width && this.currentArgs.height) {

        /**
         * crop image with given arguments
         */
        cropDim = {
            x: this.currentArgs.x - res.scrollPos.x,
            y: this.currentArgs.y - res.scrollPos.y,
            width: this.currentArgs.width,
            height: this.currentArgs.height
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
            width: typeof this.currentArgs.width !== 'undefined' ? this.currentArgs.width : res.elemBounding.width,
            height: typeof this.currentArgs.height !== 'undefined' ? this.currentArgs.height : res.elemBounding.height
        };

        exclude(shot, excludeRect);
        shot.crop(cropDim.width, cropDim.height, cropDim.x - (cropDim.width / 2), cropDim.y - (cropDim.height / 2));

    } else {
        exclude(shot, excludeRect);
    }

    return q().then(function() {
        /**
         * save image to fs
         */
        if(!that.self.saveImages) {
            return;
        }

        return q.nfcall(shot.write, that.filename || that.baselinePath);

    }).then(function() {

        /**
         * generate image buffer
         */
        return q.nfcall(shot.toBuffer, 'PNG');

    }).then(function(buffer) {

        /**
         * upload image to applitools
         */
        if (!that.self.usesApplitools) {
            return;
        }

        return q.nfcall(request, {
            qs: {apiKey: that.applitools.apiKey},
            url: that.self.host + '/api/sessions/running/' + that.self.sessionId,
            method: 'POST',
            headers: that.self.headers,
            timeout: that.self.reqTimeout,
            json: {
                'appOutput': {
                    'title': res.title,
                    'screenshot64': new Buffer(buffer).toString('base64')
                },
                'tag': that.currentArgs.tag || '',
                'ignoreMismatch': that.currentArgs.ignoreMismatch || false
            }
        });

    });

};
