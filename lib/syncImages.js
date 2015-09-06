'use strict';

var fs = require('fs-extra'),
    tar = require('tar'),
    zlib = require('zlib'),
    targz = require('tar.gz'),
    rimraf = require('rimraf'),
    request = require('request');

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
         * clear it if yes
         */
        if(fs.existsSync(self.screenshotRoot)) {
            rimraf.sync(self.screenshotRoot);
            fs.mkdirsSync(self.screenshotRoot, '0755', true);
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
        args = { url: this.api },
        tarballPath = screenshotRoot + '.tar.gz';

    if(typeof this.user === 'string' && typeof this.key === 'string') {
        args.auth = {
            user: this.user,
            pass: this.key
        };
    }

    new targz().compress(screenshotRoot, tarballPath, function(err){

        /*istanbul ignore if*/
        if(err) {
            return done(new Error(err));
        }

        var r = request.post(args, function () {
            rimraf.sync(tarballPath);
            done();
        });

        var form = r.form();
        form.append('gz', fs.createReadStream(tarballPath));

    });
};

/**
 * sync command
 * decides according to `needToSync` flag when to sync down and when to sync up
 *
 * @param  {Function} done  callback to be called after syncing
 * @return {Object}         WebdriverCSS instance
 */
module.exports = function(done) {

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
