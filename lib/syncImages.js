'use strict';

var tar = require('tar');
var zlib = require('zlib');
var Promise = require('bluebird');
var targz = require('tar.gz');
Promise.promisifyAll(targz.prototype);
var fs = require('fs-extra');
Promise.promisifyAll(fs);
var request = require('request');
Promise.promisifyAll(request);
var rimraf = Promise.promisify(require('rimraf'));
var streamToPromise = require('./util/streamToPromise');
var assign = require('object-assign');

/**
 * sync down
 * downloads tarball from API and unzip it
 *
 * @param  {Function} done  callback to be called after sync finishes
 */
function syncDown(ctx) {

    return Promise.fromCallback(function(done) {
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

         var r = request.get(args);

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
                 return done(new Error('unexpected statusCode (' + resp.statusCode + ' != 200) or content-type (' +
                    resp.headers['content-type'] + ' != application/octet-stream)'));
             }

             /**
              * check if repository directory already exists and
              * clear it if yes
              */
             if(fs.existsSync(ctx.screenshotRoot)) {
                 rimraf.sync(ctx.screenshotRoot);
                 fs.mkdirsSync(ctx.screenshotRoot, '0755', true);
             }

             resp.pipe(zlib.Gunzip()).pipe(tar.Extract({ path: '.' })).on('end', done);

         });
     });
 }

/**
 * sync up
 * zips image repository and uploads it to API
 *
 * @param  {Function} done  callback to be called after tarball was uploaded
 */
function syncUp(ctx) {
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
}

/**
 * sync command
 * decides according to `needToSync` flag when to sync down and when to sync up
 *
 * @param  {Function} done  callback to be called after syncing
 * @return {Object}         WebdriverCSS instance
 */
module.exports = function() {

    var ctx = this;

    return Promise.try(function() {
        if(!ctx.api) {
            throw new Error('No sync options specified! Please provide an api path and user/key (optional).');
        }

        var sync = ctx.needToSync ? syncUp : syncDown;
        ctx.needToSync = false;

        return sync(ctx);
    });

};
