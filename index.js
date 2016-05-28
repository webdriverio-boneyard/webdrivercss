/**
 * WebdriverCSS
 * Regression testing tool for WebdriverIO
 *
 * @author Christian Bromann <christian@saucelabs.com>
 * @license Licensed under the MIT license.
 */

module.exports = process.env.WEBDRIVERCSS_COVERAGE === '1' ? require('./build-cov/webdrivercss.js') : require('./build/webdrivercss.js');
