/**
 * WebdriverCSS
 */

var fs = require('fs'),
    tar = require('tar'),
    zlib = require('zlib'),
    targz = require('tar.gz'),
    request = require('request'),
    workflow = require('./workflow.js');

/**
 * initialise plugin
 */
var WebdriverCSS = module.exports.init = function(webdriverInstance, options) {
    options = options || {};

    if(!webdriverInstance) {
        throw new Error('A WebdriverJS instance is needed to initialise WebdriverCSS');
    }

    var that = this;

    this.screenshotRoot = options.screenshotRoot || 'webdrivercss';
    this.failedComparisonsRoot = options.failedComparisonsRoot || (this.screenshotRoot + '/diff');
    this.misMatchTolerance = options.misMatchTolerance || 0.05;
    this.screenWidth = options.screenWidth;
    this.warning = [];

    /**
     * create directory structure
     */
    fs.exists(this.screenshotRoot, function(exists) {
        if(!exists) {
            fs.mkdir(that.screenshotRoot, 0766, function() {
                fs.mkdir(that.failedComparisonsRoot, 0766);
            });
        }
    });

    /**
     * add WebdriverCSS command to WebdriverJS instance
     */
    webdriverInstance.addCommand('webdrivercss', workflow.bind(this, webdriverInstance));
    webdriverInstance.addCommand('sync', syncImages.bind(this, webdriverInstance));

    return this;
};

var syncImages = function(webdriverInstance, opts, done) {
    var sync = this.needToSync ? syncUp : syncDown;
    this.syncOpts = opts || this.syncOpts;

    sync.call(this,this.syncOpts,done);
    return this;
};

var syncDown = function(opts, done) {
    var req = request({
        url: 'http://' + opts.host + ':' + opts.port + (opts.path || '/') + this.screenshotRoot + '.tar.gz',
        headers: { 'accept-encoding': 'gzip,deflate' }
    });

    req.on('response', function(resp) {

        if(resp.statusCode !== 200 || resp.headers['content-type'] !== 'application/octet-stream') {
            return done();
        };

        resp.pipe(zlib.Gunzip()).pipe(tar.Extract({ path: '.' })).on('end', done);
    });
};

var syncUp = function(opts, done) {
    var screenshotRoot = this.screenshotRoot;

    var compress = new targz().compress(screenshotRoot, screenshotRoot + '.tar.gz', function(err){
        if(err) console.log(err);

        var r = request.post('http://' + opts.host + ':' + opts.port + opts.path);
        var form = r.form();
        form.append('gz', fs.createReadStream(screenshotRoot + '.tar.gz'));
    });
};