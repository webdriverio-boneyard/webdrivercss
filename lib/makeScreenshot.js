'use strict';

/**
 * make screenshot via [GET] /session/:sessionId/screenshot
 */
var modifyElements = function(elements, style, value) {
    if(elements.length === 0) {
        return;
    }

    this.instance.selectorExecute(elements, function() {
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

module.exports = function(done) {

    /**
     * take actual screenshot in given screensize just once
     */
    if(this.self.takeScreenshot === false) {
        return done();
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
     * hide / remove elements
     */
    modifyElements.call(this, hiddenElements, 'visibility', 'hidden');
    modifyElements.call(this, removeElements, 'display', 'none');

    /**
     * take 100ms pause to give browser time for rendering
     */
    this.instance.pause(100).saveDocumentScreenshot(this.screenshot, done);

    /**
     * make hidden elements visible again
     */
    modifyElements.call(this, hiddenElements, 'visibility', '');
    modifyElements.call(this, removeElements, 'display', '');

};
