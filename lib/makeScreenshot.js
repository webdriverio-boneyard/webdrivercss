/**
 * make screenshot via [GET] /session/:sessionId/screenshot
 */

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

        }, [this.args.hide]);
    }

    /**
     * scroll to desired DOM element if given
     */
    if(this.args.elem && typeof this.args.elem === 'string') {

        this.instance.execute(function() {
            var elemBounding = document.querySelector(arguments[0]).getBoundingClientRect();
            window.scrollTo( window.scrollX + elemBounding.left, window.scrollY + elemBounding.top);
        },[this.args.elem]).pause(1000);

    } else if(this.args.x && this.args.y) {

        this.instance.execute('window.scrollTo(arguments[0],arguments[1]);',[this.args.x,this.args.y]);

    }

    /**
     * take actual screenshot
     * take 100ms pause to give browser time for rendering
     */
    this.instance.pause(100).screenshot(done);

    /**
     * make hidden elements visible again
     */
    if(typeof this.args.hide === 'string') {
        this.instance.execute(function(elemsToHideSelector) {

            var elemsToHide = document.querySelectorAll(elemsToHideSelector);

            for(var j = 0; j < elemsToHide.length; ++j) {
                elemsToHide[j].style.visibility = 'visible';
            }

        }, [this.args.hide]);
    }

};