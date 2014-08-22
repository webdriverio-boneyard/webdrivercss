describe('WebdriverCSS should be able to', function() {

    before(function(done) {

        this.browser = WebdriverIO.remote(capabilities);

        // init plugin
        var plugin = WebdriverCSS.init(this.browser);

        this.browser
            .init()
            .windowHandleSize({ width: 800, height: 600 })
            .call(done);

    });

    describe('take a shot instantly',function() {

        it('when no timeout was set',function(done) {
            this.browser
                .url(testurl)
                .webdrivercss('timeoutTest', {
                    elem: '.notLoaded'
                })
                .call(function() {
                    gm.compare('webdrivercss/timeoutTest.current.png', 'test/fixtures/timeoutTest.current.png', function (err, isEqual, equality, raw) {
                        should.not.exist(err);
                        isEqual.should.be.equal(true);
                        done();
                    });
                });
        });

        it('when timeout argument is not a number',function(done) {
            this.browser
                .url(testurl)
                .webdrivercss('timeoutMalformedTest', {
                    elem: '.notLoaded',
                    timeout: '100ms'
                })
                .call(function() {
                    gm.compare('webdrivercss/timeoutMalformedTest.current.png', 'test/fixtures/timeoutTest.current.png', function (err, isEqual, equality, raw) {
                        should.not.exist(err);
                        isEqual.should.be.equal(true);
                        done();
                    });
                });
        });

    });

    it('takes a screenshout after certain amount of time to load things properly',function(done) {

        this.browser
            .url(testurl)
            .webdrivercss('timeoutTestWorking', {
                elem: '.notLoaded',
                timeout: 3100
            })
            .call(function() {
                gm.compare('webdrivercss/timeoutTestWorking.current.png', 'test/fixtures/timeoutTestWorking.current.png', function (err, isEqual, equality, raw) {
                    should.not.exist(err);
                    isEqual.should.be.equal(true);
                    done();
                });
            });
    });

    after(afterHook);

});
