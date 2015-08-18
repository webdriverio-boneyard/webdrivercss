'use strict';

/**
 * make screenshot via [GET] /session/:sessionId/screenshot
 */
var modifyElements = function(elements, style, value) {

    if(elements.length === 0) {
        return;
    }

    return this.instance.selectorExecute(elements, function() {
        var args = Array.prototype.slice.call(arguments).filter(function(n){ return !!n; }),
            style = args[args.length - 2],
            value = args[args.length - 1];

        args.splice(-2);
        for(var i = 0; i < args.length; ++i) {
            for(var j = 0; j < args[i].length; ++j) {
                args[i][j].style[style] = value;
            }
        }

    }, style, value);
};

module.exports = function() {
    console.log('makeScreenshot');

    /**
     * take actual screenshot in given screensize just once
     */
    if(this.self.takeScreenshot === false) {
        return;
    }

    this.self.takeScreenshot = false;

    /**
     * gather all elements to hide
     */
    var hiddenElements = [],
        removeElements = [];
    this.queuedShots.forEach(function(args) {
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
     * take 100ms pause to give browser time for rendering
     */
    return this.instance

        /**
         * hide / remove elements
         */
        .then(modifyElements.bind(this, hiddenElements, 'visibility', 'hidden'))
        .then(modifyElements.bind(this, removeElements, 'display', 'none'))

        .pause(100)
        .saveDocumentScreenshot(this.screenshot)

        /**
         * make hidden elements visible again
         */
        .then(modifyElements.bind(this, hiddenElements, 'visibility', ''))
        .then(modifyElements.bind(this, removeElements, 'display', ''));

};
