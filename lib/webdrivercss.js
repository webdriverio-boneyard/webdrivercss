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

    /**
     * general options
     */
    this.screenshotRoot = options.screenshotRoot || 'webdrivercss';
    this.failedComparisonsRoot = options.failedComparisonsRoot || (this.screenshotRoot + '/diff');
    this.misMatchTolerance = options.misMatchTolerance || 0.05;
    this.screenWidth = options.screenWidth;
    this.warning = [];
    this.instance = webdriverInstance;

    /**
     * sync options
     */
    this.username = options.username;
    this.key = options.key;
    this.api = options.api;

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
    this.instance.addCommand('webdrivercss', workflow.bind(this));
    this.instance.addCommand('sync', syncImages.bind(this));

    return this;
};

var syncImages = function(done) {

    if(!this.api) {
        return done(new Error('No sync options specified! Please provide an api path and username/key (optional).'));
    }

    var sync = this.needToSync ? syncUp : syncDown;
    this.needToSync = false;

    sync.call(this, function(err, httpResponse, body) {

        if(err || (httpResponse && httpResponse.statusCode !== 200)) {
            return done(new Error(err || body));
        }

        done();

    });
    return this;
};

var syncDown = function(done) {

    var args = {
        url: this.api + (this.api.substr(-1) !== '/' ? '/' : '') + this.screenshotRoot + '.tar.gz',
        headers: { 'accept-encoding': 'gzip,deflate' },
    };

    if(typeof this.username === 'string' && typeof this.key === 'string') {
        args.auth = {
            user: this.username,
            pass: this.key
        };
    }

    var r = request.get(args);

    r.on('error', done);
    r.on('response', function(resp) {

        if(resp.statusCode !== 200 || resp.headers['content-type'] !== 'application/octet-stream') {
            return done(new Error('unexpected statusCode (' + resp.statusCode + ' != 200) or content-type (' + resp.headers['content-type'] + ' != application/octet-stream)'));
        }

        resp.pipe(zlib.Gunzip()).pipe(tar.Extract({ path: '.' })).on('end', done);

    });
};

var syncUp = function(done) {
    var screenshotRoot = this.screenshotRoot,
        args = { url: this.api };

    if(typeof this.username === 'string' && typeof this.key === 'string') {
        args.auth = {
            user: this.username,
            pass: this.key
        };
    }

    var compress = new targz().compress(screenshotRoot, screenshotRoot + '.tar.gz', function(err){

        if(err) {
            return done(new Error(err));
        }

        var r = request.post(args, done);

        var form = r.form();
        form.append('gz', fs.createReadStream(screenshotRoot + '.tar.gz'));

    });
};
