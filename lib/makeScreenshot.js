'use strict';

var q = require('q');

/**
 * make screenshot via [GET] /session/:sessionId/screenshot
 */
var modifyElements = function(elements, style, value) {
    if(elements.length === 0) {
        return;
    }

    var deferred = q.defer();

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

    }, style, value)
      .then(deferred.resolve)
      .catch(deferred.reject);

    return deferred.promise
};

module.exports = function(done) {
    var that = this;

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
    q.all([
        modifyElements.call(that, hiddenElements, 'visibility', 'hidden'),
        modifyElements.call(that, removeElements, 'display', 'none')
    ])
        .then(function () {
            /**
             * take 100ms pause to give browser time for rendering
             */

            var deferred = q.defer();

            that.instance
              .pause(100)
              .saveDocumentScreenshot(that.screenshot)
              .then(deferred.resolve)
              .catch(deferred.reject);

            return deferred.promise;
        })
        .then(function () {
            /**
             * make hidden elements visible again
             */
            return q.all([
                modifyElements.call(that, hiddenElements, 'visibility', ''),
                modifyElements.call(that, removeElements, 'display', '')
            ]);
        })
        .then(function () {
            done();
        })
        .done();

};
