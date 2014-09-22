/**
 * make screenshot via [GET] /session/:sessionId/screenshot
 */
var fs = require('fs'),
    takenShots = {};

module.exports = function(done) {

    /**
     * take actual screenshot in given screensize just once
     */
    if(this.takeScreenshot === false) {
        return done();
    }

    this.takeScreenshot = false;

    /**
     * gather all elements to hide
     */
    var hiddenElements = (this.args.map(function(args) {
        return args.hide;
    }).filter(function(args){ return args != undefined }));

    /**
     * concatenate to one dimensional array
     */
    var sanitizedElements = [];
    hiddenElements.forEach(function(argElem) {
        if(argElem instanceof Array) {
            for(var i = 0; i < argElem.length; ++i) {
                sanitizedElements.push(argElem[i]);
            }
        } else {
            sanitizedElements.push(argElem);
        }
    })

    /**
     * hide elements
     */
    if(sanitizedElements.length) {
        this.instance.selectorExecute(sanitizedElements, function() {

            for(var i = 0; i < arguments.length; ++i) {
                for(var j = 0; j < arguments[i].length; ++j) {
                    arguments[i][j].style.visibility = 'hidden';
                }
            }

        }, function(){});
    }

    /**
     * take 100ms pause to give browser time for rendering
     */
    this.instance.pause(100).saveDocumentScreenshot(this.screenshot, done);

    /**
     * make hidden elements visible again
     */
    if(sanitizedElements.length) {
        this.instance.selectorExecute(sanitizedElements, function() {

            for(var i = 0; i < arguments.length; ++i) {
                for(var j = 0; j < arguments[i].length; ++j) {
                    arguments[i][j].style.visibility = 'visible';
                }
            }

        }, function(){});
    }

};
