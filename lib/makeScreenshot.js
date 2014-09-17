/**
 * make screenshot via [GET] /session/:sessionId/screenshot
 */
var fs = require('fs'),
    takenShots = {};

module.exports = function(done) {

    /**
     * take actual screenshot in given screensize just once
     */
    if(!this.takeScreenshot) {
        return done();
    }

    this.takeScreenshot = false;

    /**
     * gather all elements to hide
     */
    var hiddenElements = (this.args.map(function(args) {
        return args.hide;
    }).filter(function(args){ return args != undefined }).join(', '));

    /**
     * hide elements
     */
    if(typeof hiddenElements === 'string') {
        this.instance.execute(function(elemsToHideSelector) {

            var elemsToHide = document.querySelectorAll(elemsToHideSelector);

            for(var j = 0; j < elemsToHide.length; ++j) {
                elemsToHide[j].style.visibility = 'hidden';
            }

        }, hiddenElements);
    }

    /**
     * take 100ms pause to give browser time for rendering
     */
    this.instance.pause(100).saveDocumentScreenshot(this.screenshot, done);

    /**
     * make hidden elements visible again
     */
    if(typeof hiddenElements === 'string') {
        this.instance.execute(function(elemsToHideSelector) {

            var elemsToHide = document.querySelectorAll(elemsToHideSelector);

            for(var j = 0; j < elemsToHide.length; ++j) {
                elemsToHide[j].style.visibility = 'visible';
            }

        }, hiddenElements);
    }

};
