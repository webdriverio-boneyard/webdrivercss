/**
 * make screenshot via [GET] /session/:sessionId/screenshot
 */

module.exports = function(done) {

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

    this.instance.screenshot(done);

};