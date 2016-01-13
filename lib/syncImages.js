'use strict';

var tar = require('tar');
var zlib = require('zlib');
var Promise = require('bluebird');
var targz = Promise.promisify(require('tar.gz'));
Promise.promisifyAll(targz.prototype);
var fs = Promise.promisifyAll(require('fs-extra'));
var request = Promise.promisifyAll(require('request'), {multiArg: true});
var rimraf = Promise.promisify(require('rimraf'));
var streamToPromise = require('./util/streamToPromise');
var assign = require('object-assign');

/**
 * sync down
 * downloads tarball from API and unzip it
 *
 * @param  {Function} done  callback to be called after sync finishes
 */
var syncDown = function(ctx) {

    var args = {
        url: ctx.api + (ctx.api.substr(-1) !== '/' ? '/' : '') + ctx.screenshotRoot + '.tar.gz',
        headers: { 'accept-encoding': 'gzip,deflate' },
    };

    if(typeof ctx.user === 'string' && typeof ctx.key === 'string') {
        args.auth = {
            user: ctx.user,
            pass: ctx.key
        };
    }

    return request.getAsync(args)
    .then(function(resp) {
        /*!
         * no error if repository doesn't exists
         */
        /*istanbul ignore if*/
        if(resp.statusCode === 404) {
            return;
        }

        /*istanbul ignore next*/
        if(resp.statusCode !== 200 || resp.headers['content-type'] !== 'application/octet-stream') {
            throw new Error('unexpected statusCode (' + resp.statusCode + ' != 200) or content-type (' +
                resp.headers['content-type'] + ' != application/octet-stream)');
        }

        /**
         * check if repository directory already exists and
         * clear it if yes
         */
        return fs.existsAsync(ctx.screenshotRoot)
        .then(function(exists) {
            if (exists) {
                return rimraf(ctx.screenshotRoot)
                .then(function() {
                    fs.mkdirsAsync(ctx.screenshotRoot, '0755', true);
                });
            }
        })
        .then(function() {
            return streamToPromise(resp.pipe(zlib.Gunzip()).pipe(tar.Extract({ path: '.' })));
        });
    });
};

/**
 * sync up
 * zips image repository and uploads it to API
 *
 * @param  {Function} done  callback to be called after tarball was uploaded
 */
var syncUp = function(ctx) {
    var screenshotRoot = ctx.screenshotRoot,
        args = { url: ctx.api },
        tarballPath = screenshotRoot + '.tar.gz';

    if(typeof ctx.user === 'string' && typeof ctx.key === 'string') {
        args.auth = {
            user: ctx.user,
            pass: ctx.key
        };
    }

    return new targz().compressAsync(screenshotRoot, tarballPath)
    .then(function() {
        return request.postAsync(assign({}, args, {formData: {gz: fs.createReadStream(tarballPath)}}))
        .then(function() {
            return rimraf(tarballPath);
        });
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

    return Promise.try(function() {
        if(!this.api) {
            throw new Error('No sync options specified! Please provide an api path and user/key (optional).');
        }

        var sync = this.needToSync ? syncUp : syncDown;
        this.needToSync = false;

        return sync(this);
    }).nodeify(done);

};
