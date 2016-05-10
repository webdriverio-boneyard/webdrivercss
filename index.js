'use strict';

/**
 * WebdriverCSS
 * Regression testing tool for WebdriverIO
 *
 * @author Christian Bromann <christian@saucelabs.com>
 * @license Licensed under the MIT license.
 */

module.exports = process.env.WEBDRIVERCSS_COVERAGE === '1' ? require('./lib-cov/webdrivercss.js') : require('./lib/webdrivercss.js');
