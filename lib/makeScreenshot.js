/**
 * make screenshot via [GET] /session/:sessionId/screenshot
 */
var fs = require('fs');

module.exports = function(done) {

    /**
     * hide elements
     */
    if(typeof this.args.hide === 'string') {
        this.instance.execute(function(elemsToHideSelector) {

            var elemsToHide = document.querySelectorAll(elemsToHideSelector),
                x = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
                y = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

            for(var j = 0; j < elemsToHide.length; ++j) {
                elemsToHide[j].style.visibility = 'hidden';
            }

        }, this.args.hide);
    }

    /**
     * take actual screenshot
     * take 100ms pause to give browser time for rendering
     */
    if(!fs.existsSync(this.screenshot)) {
        this.instance.pause(100).saveDocumentScreenshot(this.screenshot, done);
    } else {
        done()
    }

    /**
     * make hidden elements visible again
     */
    if(typeof this.args.hide === 'string') {
        this.instance.execute(function(elemsToHideSelector) {

            var elemsToHide = document.querySelectorAll(elemsToHideSelector);

            for(var j = 0; j < elemsToHide.length; ++j) {
                elemsToHide[j].style.visibility = 'visible';
            }

        }, this.args.hide);
    }

};
