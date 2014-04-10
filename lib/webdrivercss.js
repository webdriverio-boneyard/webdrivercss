/**
 * WebdriverCSS
 */

var fs = require('fs'),
    tar = require('tar'),
    zlib = require('zlib'),
    targz = require('tar.gz'),
    request = require('request'),
    workflow = require('./workflow.js'),
    instance = null;

/**
 * initialise plugin
 */
var WebdriverCSS = module.exports.init = function(webdriverInstance, options) {
    options = options || {};

    if(!webdriverInstance) {
        throw new Error('A WebdriverJS instance is needed to initialise WebdriverCSS');
    }

    var that = this;
    instance = webdriverInstance;

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

    return this;
};

var syncImages = module.exports.sync = function(opts) {
    var sync = this.needToSync ? syncUp : syncDown;
    this.syncOpts = opts || this.syncOpts;

    console.log('sync call', opts);

    instance.addCommand('__webdriverjssync', sync.call(this,this.syncOpts));
    instance.__webdriverjssync();
    delete instance.__webdriverjssync;

    return this;
};

var syncDown = function(opts) {
    var that = this;
    console.log('sync dowm');

    return function(done) {
        var req = request({
            url: 'http://' + opts.host + ':' + opts.port + (opts.path || '/') + that.screenshotRoot + '.tar.gz',
            headers: { 'accept-encoding': 'gzip,deflate' }
        });

        req.on('response', function(resp) {

            if(resp.statusCode !== 200 || resp.headers['content-type'] !== 'application/octet-stream') {
                return done();
            };

            resp.pipe(zlib.Gunzip()).pipe(tar.Extract({ path: '.' })).on('end', function () {
                done();
            });
        });
    };
};

var syncUp = function(opts) {
    var that = this;

    console.log('sync up');
    return function(done) {
        var compress = new targz().compress(that.screenshotRoot, that.screenshotRoot + '.tar.gz', function(err){
            if(err) console.log(err);

            var r = request.post('http://' + opts.host + ':' + opts.port + opts.path);
            var form = r.form();
            form.append('my_field', 'my_value');
            form.append('gz', fs.createReadStream(that.screenshotRoot + '.tar.gz'));
        });
    };
};