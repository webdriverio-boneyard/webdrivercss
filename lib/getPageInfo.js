/**
 * get page informations
 * IMPORTANT: all of this code gets executed on browser side, so you won't have
 *            access to node specific interfaces at all
 */

module.exports = function(done) {

    /**
     * execute frontend code
     */
    this.instance.execute(function() {

        var exclude = arguments[1],
            excludeRect = [];

        /**
         * little helper function to check against argument values
         * @param  {Object}  variable  some variable
         * @return {Boolean}           is true if typeof variable is number
         */
        function isNumber(variable) {
            return typeof variable === 'number';
        }

        /**
         * exclude param is CSS selector string
         */
        if(exclude && typeof exclude === 'string') {
            var elemsRect = document.querySelectorAll(exclude);

            for(var i = 0; i < elemsRect.length; ++i) {
                var elemRect = elemsRect[i].getBoundingClientRect();

                excludeRect.push({
                    x0: elemRect.left,
                    y0: elemRect.top,
                    x1: elemRect.left + elemRect.width,
                    y1: elemRect.top + elemRect.height
                });
            }

        /**
         * exclude param is set of x,y rectangle
         */
        } else if(exclude && exclude instanceof Array) {

            exclude.forEach(function(item,i) {

                if(isNumber(item.x0) && isNumber(item.x1) && isNumber(item.y0) && isNumber(item.y1)) {
                    excludeRect.push(item);
                }

            });

        /**
         * exclude param is x,y rectangle
         */
        } else if(exclude && isNumber(exclude.x0) && isNumber(exclude.x1) && isNumber(exclude.y0) && isNumber(exclude.y1)) {
            excludeRect.push(exclude);
        }

        return {
            screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
            elemBounding: (arguments[0] && document.querySelector(arguments[0])) ? document.querySelector(arguments[0]).getBoundingClientRect() : null,
            excludeRect: excludeRect,
            url: window.location.href
        }

    },[this.args.elem,this.args.exclude],done);

};