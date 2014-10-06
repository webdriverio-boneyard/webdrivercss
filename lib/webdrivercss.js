/**
 * WebdriverCSS
 */

var fs = require('fs'),
    tar = require('tar'),
    zlib = require('zlib'),
    end = require('./commands/end'),
    init = require('./commands/init'),
    targz = require('tar.gz'),
    rimraf = require('rimraf'),
    request = require('request'),
    workflow = require('./workflow.js'),
    viewportScreenshot = require('./viewportScreenshot.js'),
    documentScreenshot = require('./documentScreenshot.js');

/**
 * initialise plugin
 */
var WebdriverCSS = function(webdriverInstance, options) {
    options = options || {};

    if(!webdriverInstance) {
        throw new Error('A WebdriverIO instance is needed to initialise WebdriverCSS');
    }

    var that = this;

    /**
     * general options
     */
    this.screenshotRoot = options.screenshotRoot || 'webdrivercss';
    this.failedComparisonsRoot = options.failedComparisonsRoot || (this.screenshotRoot + '/diff');
    this.misMatchTolerance = options.misMatchTolerance || 0.05;
    this.screenWidth = options.screenWidth || [1200];
    this.warning = [];
    this.instance = webdriverInstance;

    /**
     * sync options
     */
    this.key  = options.key;
    this.host = 'https://eyessdk.applitools.com';
    this.headers = {
        'Authorization': 'Basic ' + new Buffer(':' + this.key).toString('base64'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    this.reqTimeout = 5 * 60 * 1000;
    this.user = options.user;
    this.api  = options.api;

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
     * add WebdriverCSS command to WebdriverIO instance
     */
    this.instance.addCommand('saveViewportScreenshot', viewportScreenshot.bind(this));
    this.instance.addCommand('saveDocumentScreenshot', documentScreenshot.bind(this));
    this.instance.addCommand('webdrivercss', workflow.bind(this));
    this.instance.addCommand('sync', syncImages.bind(this));

    /**
     * overwrite webdriverio commands if user provides applitools key
     */
    this.usesApplitools = typeof this.key === 'string';
    if(this.usesApplitools) {
        this._init = this.instance.init;
        this.instance.addCommand('init', init.bind(this));
        this._end = this.instance.end;
        this.instance.addCommand('end', end.bind(this));
    }

    return this;
};

/**
 * sync command
 * decides according to `needToSync` flag when to sync down and when to sync up
 *
 * @param  {Function} done  callback to be called after syncing
 * @return {Object}         WebdriverCSS instance
 */
var syncImages = function(done) {

    if(!this.api) {
        return done(new Error('No sync options specified! Please provide an api path and user/key (optional).'));
    }

    var sync = this.needToSync ? syncUp : syncDown;
    this.needToSync = false;

    sync.call(this, function(err, httpResponse, body) {

        /*istanbul ignore next*/
        if(err || (httpResponse && httpResponse.statusCode !== 200)) {
            return done(new Error(err || body));
        }

        done();

    });
    return this;
};

/**
 * sync down
 * downloads tarball from API and unzip it
 *
 * @param  {Function} done  callback to be called after sync finishes
 */
var syncDown = function(done) {

    var args = {
        url: this.api + (this.api.substr(-1) !== '/' ? '/' : '') + this.screenshotRoot + '.tar.gz',
        headers: { 'accept-encoding': 'gzip,deflate' },
    };

    if(typeof this.user === 'string' && typeof this.key === 'string') {
        args.auth = {
            user: this.user,
            pass: this.key
        };
    }

    var r = request.get(args),
        self = this;

    r.on('error', done);
    r.on('response', function(resp) {

        /*!
         * no error if repository doesn't exists
         */
        /*istanbul ignore if*/
        if(resp.statusCode === 404) {
            return done();
        }

        /*istanbul ignore next*/
        if(resp.statusCode !== 200 || resp.headers['content-type'] !== 'application/octet-stream') {
            return done(new Error('unexpected statusCode (' + resp.statusCode + ' != 200) or content-type (' + resp.headers['content-type'] + ' != application/octet-stream)'));
        }

        /**
         * check if repository directory already exists and
         * remove it if yes
         */
        if(fs.existsSync(self.screenshotRoot)) {
            rimraf.sync(self.screenshotRoot);
        }

        resp.pipe(zlib.Gunzip()).pipe(tar.Extract({ path: '.' })).on('end', done);

    });
};

/**
 * sync up
 * zips image repository and uploads it to API
 *
 * @param  {Function} done  callback to be called after tarball was uploaded
 */
var syncUp = function(done) {
    var screenshotRoot = this.screenshotRoot,
        args = { url: this.api };

    if(typeof this.user === 'string' && typeof this.key === 'string') {
        args.auth = {
            user: this.user,
            pass: this.key
        };
    }

    var compress = new targz().compress(screenshotRoot, screenshotRoot + '.tar.gz', function(err){

        /*istanbul ignore if*/
        if(err) {
            return done(new Error(err));
        }

        var r = request.post(args, done);

        var form = r.form();
        form.append('gz', fs.createReadStream(screenshotRoot + '.tar.gz'));

    });
};

/**
 * expose WebdriverCSS
 */
module.exports.init = function(webdriverInstance, options) {
    return new WebdriverCSS(webdriverInstance, options);
};
