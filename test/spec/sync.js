/*jshint -W030 */

var fs = require('fs'),
    nock = require('nock'),
    path = require('path');

nock.enableNetConnect();

describe('WebdriverCSS should be able to', function() {

    describe('sync the image repository with an external API', function() {

        before(function(done) {
            this.browser = WebdriverIO.remote(capabilities);

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

        it('throws an error if API isn\'t provided', function(done) {
            var browser = WebdriverIO.remote(capabilities);
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
                .webdrivercss('testWithoutParameter', {
                    name: 'test'
                })
                .sync()
                .call(function() {
                    expect(madeRequest).to.be.true;

                    // should delete the tarball file after syncing
                    expect(fs.existsSync(path.join(__dirname, '..', '..', 'webdrivercss.tar.gz'))).to.be.false;
                })
                .call(done);

        });

        after(afterHook);
    });


    describe('sync images with applitools eyes', function() {
        var key = 'ABCDEFG12345',
            fakeSessionId = 123456789012345,
            applitoolsHost = 'https://eyessdk.applitools.com',
            isSessionInitiated = false,
            hasSyncedImage = false,
            updateBaseline = false,
            isSessionClosed = false;

        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        /**
         * mock session initiatlization
         */
        nock(applitoolsHost, {reqheaders: headers})
            .post('/api/sessions/running?apiKey=' + key)
            .reply(200, function(uri, requestBody) {
                isSessionInitiated = true;
                return {
                    'id': fakeSessionId,
                    'url': 'https://eyes.applitools.com/app/sessions/' + fakeSessionId
                };
            });

        /**
         * mock image sync
         */
        nock(applitoolsHost, {reqheaders: headers})
            .post('/api/sessions/running/' + fakeSessionId + '?apiKey=' + key)
            .reply(200, function(uri, requestBody) {
                hasSyncedImage = true;
                return { 'asExpected' : true };
            });

        /**
         * mock session end
         */
        nock(applitoolsHost, {reqheaders: headers})
            .delete('/api/sessions/running/' + fakeSessionId + '?apiKey=' + key + '&updateBaseline=' + updateBaseline)
            .reply(200, function(uri, requestBody) {
                isSessionClosed = true;
                return {'steps':1,'matches':1,'mismatches':0,'missing':0};
            });

        before(function(done) {
            this.browser = WebdriverIO.remote(capabilities);

            // init plugin
            var plugin = WebdriverCSS.init(this.browser, {
                key:  key,
                updateBaseline: updateBaseline
            });

            this.browser
                .init()
                .url(testurl)
                .webdrivercss('applitoolstest', {
                    name: 'page'
                }, done);
        });

        it('should throw an error if no app id is provided', function() {
            expect(isSessionInitiated).to.be.true;
        });

        it('should sync images with applitools eyes', function() {
            expect(hasSyncedImage).to.be.true;
        });

        it('should end applitools session', function() {
            expect(isSessionClosed).to.be.true;
        });

        after(afterHook);
    });
});
