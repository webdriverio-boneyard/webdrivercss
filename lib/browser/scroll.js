/**
 * Since some drivers only take screenshots of the viewport area of the
 * browser WebdriverCSS needs to scroll through the page in order to capture
 * everything. This gets done by translate as it doesn't affect pages that
 * trigger certain events on page scroll
 */
module.exports = function(w, h) {
    /**
     * IE8 or older
     */
    if(document.all && !document.addEventListener) {
        /**
         * this still might not work
         * seems that IE8 scroll back to 0,0 before taking screenshots
         */
        document.body.style.marginTop = '-' + h + 'px';
        document.body.style.marginLeft = '-' + w + 'px';
        return;
    }

    document.body.style.webkitTransform = 'translate(-' + w + 'px, -' + h + 'px)';
    document.body.style.mozTransform = 'translate(-' + w + 'px, -' + h + 'px)';
    document.body.style.msTransform = 'translate(-' + w + 'px, -' + h + 'px)';
    document.body.style.oTransform = 'translate(-' + w + 'px, -' + h + 'px)';
    document.body.style.transform = 'translate(-' + w + 'px, -' + h + 'px)';
};