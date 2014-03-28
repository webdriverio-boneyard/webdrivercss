/**
 * WebdriverCSS
 * Regression testing tool for WebdriverJS
 * 
 * @author Christian Bromann <mail@christian-bromann.com>
 * @license Licensed under the MIT license.
 */

module.exports = require( (process.env['WEBDRIVERCSS_COV'] ? './lib-cov' : './lib') + '/webdrivercss.js');