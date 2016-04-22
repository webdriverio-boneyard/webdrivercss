'use strict';

var Promise = require('bluebird');

/**
 * make screenshot via [GET] /session/:sessionId/screenshot
 */
var modifyElements = function(elements, style, value) {
    if(elements.length === 0) {
        return Promise.resolve();
    }

    return this.instance.selectorExecute(elements, applyStyle, style, value);
};

function applyStyle() {
    var args = Array.prototype.slice.call(arguments).filter(function(n){ return !!n; }),
        style = args[args.length - 2],
        value = args[args.length - 1];

    args.splice(-2);
    for(var i = 0; i < args.length; ++i) {
        for(var j = 0; j < args[i].length; ++j) {
            args[i][j].style[style] = value;
        }
    }

}

module.exports = function() {
    var ctx = this;

    /**
     * take actual screenshot in given screensize just once
     */
    if(ctx.self.takeScreenshot === false) {
        return Promise.resolve();
    }

    ctx.self.takeScreenshot = false;

    /**
     * gather all elements to hide
     */
    var hiddenElements = [],
        removeElements = [];

    ctx.queuedShots.forEach(function(args) {
        if(typeof args.hide === 'string') {
            hiddenElements.push(args.hide);
        }
        if(args.hide instanceof Array) {
            hiddenElements = hiddenElements.concat(args.hide);
        }
        if(typeof args.remove === 'string') {
            removeElements.push(args.remove);
        }
        if(args.remove instanceof Array) {
            removeElements = removeElements.concat(args.remove);
        }
    });

    /**
     * hide / remove elements
     */
    return Promise.all([
        modifyElements.call(ctx, hiddenElements, 'visibility', 'hidden'),
        modifyElements.call(ctx, removeElements, 'display', 'none')
    ])
    .then(function () {
        /**
         * take 100ms pause to give browser time for rendering
         */
        return ctx.instance.pause(100).saveDocumentScreenshot(ctx.screenshot);
    })
    .then(function () {
        /**
         * make hidden elements visible again
         */
        return Promise.all([
            modifyElements.call(ctx, hiddenElements, 'visibility', ''),
            modifyElements.call(ctx, removeElements, 'display', '')
        ]);
    });
};
