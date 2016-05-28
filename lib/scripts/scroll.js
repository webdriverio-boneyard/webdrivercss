export function scroll (w, h) {
    /**
     * IE8 or older
     */
    if (document.all && !document.addEventListener) {
        /**
         * this still might not work
         * seems that IE8 scroll back to 0,0 before taking screenshots
         */
        document.body.style.marginTop = '-' + h + 'px'
        document.body.style.marginLeft = '-' + w + 'px'
        return
    }

    document.documentElement.style.webkitTransform = 'translate(-' + w + 'px, -' + h + 'px)'
    document.documentElement.style.mozTransform = 'translate(-' + w + 'px, -' + h + 'px)'
    document.documentElement.style.msTransform = 'translate(-' + w + 'px, -' + h + 'px)'
    document.documentElement.style.oTransform = 'translate(-' + w + 'px, -' + h + 'px)'
    document.documentElement.style.transform = 'translate(-' + w + 'px, -' + h + 'px)'
};
