'use strict';

/**
 * prints warning message within WebdriverIO instance
 * @param  {String} id  error type
 */

/*istanbul ignore next*/
module.exports = function(id) {
    var prefix = '\x1b[1;32mWebdriverCSS\x1b[0m\t';

    switch(id) {
        case 'NoElementFound':
        this.logger.log(prefix + 'Couldn\'t find element on page');
        this.logger.log(prefix + 'taking screenshot of whole website'); break;

        case 'ArgumentsMailformed':
        this.logger.log(prefix + 'No element or bounding is given');
        this.logger.log(prefix + 'taking screenshot of whole website'); break;

        case 'DimensionWarning':
        this.logger.log(prefix + 'new image snapshot has a different dimension'); break;

        default:
        this.logger.log(prefix + 'Unknown warning');
    }
};
