/*jshint -W030 */

var fs = require('fs'),
    nock = require('nock'),
    path = require('path');

describe('WebdriverCSS should be able to', function() {

    before(function(done) {

        this.browser = WebdriverJS.remote(capabilities);

        // init plugin
        var plugin = WebdriverCSS.init(this.browser, {
            api:  'http://127.0.0.1:8081/webdrivercss/api',
            user: 'johndoe',
            key:  'xyz'
        });

        this.browser
            .init()
            .url(testurl)
            .call(done);

    });

    describe('sync the image repository with an API', function() {

        it('throws an error if API isn\'t provided', function(done) {
            var browser = WebdriverJS.remote(capabilities);
            WebdriverCSS.init(browser);

            browser.init().sync(function(err) {
                expect(err).not.to.be.null;
            }).end(done);
        });

        it('should download and unzip a repository by calling sync() for the first time', function(done) {

            var scope = nock('http://127.0.0.1:8081')
                .defaultReplyHeaders({
                    'Content-Type': 'application/octet-stream'
                })
                .get('/webdrivercss/api/webdrivercss.tar.gz')
                .reply(200, function(uri, requestBody) {
                    return fs.createReadStream(path.join(__dirname, '..', 'fixtures', 'webdrivercss.tar.gz'));
                });

            this.browser.sync().call(function() {
                expect(fs.existsSync(path.join(__dirname, '..', '..', 'webdrivercss'))).to.be.true;
                expect(fs.existsSync(path.join(__dirname, '..', '..', 'webdrivercss', 'comparisonTest.current.png'))).to.be.true;
            }).call(done);

        });

        it('should zip and upload repository to API after test run', function(done) {

            var madeRequest = false;
            var scope = nock('http://127.0.0.1:8081')
                .defaultReplyHeaders({
                    'Content-Type': 'application/octet-stream'
                })
                .post('/webdrivercss/api')
                .reply(200, function(uri, requestBody) {
                    madeRequest = true;
                });

            this.browser
                .webdrivercss('testWithoutParameter')
                .sync()
                .call(function() {
                    expect(madeRequest).to.be.true;
                })
                .call(done);
        
        });


    });

    after(afterHook);

});