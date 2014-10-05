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
    var hiddenElements = this.currentArgs instanceof Array ? this.currentArgs.hide : [];

    /**
     * hide elements
     */
    if(hiddenElements.length) {
        this.instance.selectorExecute(hiddenElements, function() {

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
    if(hiddenElements.length) {
        this.instance.selectorExecute(hiddenElements, function() {

            for(var i = 0; i < arguments.length; ++i) {
                for(var j = 0; j < arguments[i].length; ++j) {
                    arguments[i][j].style.visibility = 'visible';
                }
            }

        }, function(){});
    }

};
