describe('WebdriverCSS should hide parts of websites to ignore changing content', function() {

    before(function(done) {

        this.browser = WebdriverIO.remote(capabilities);

        // init plugin
        WebdriverCSS.init(this.browser);

        this.browser
            .init()
            .windowHandleSize({ width: 800, height: 600 })
            .call(done);

    });

    it('should hide constantly changing content using CSS selectors', function(done) {
        this.browser
            .url(testurlThree)
            .webdrivercss('hideUsingCssSelectors', {
                elem: '.third',
                hide: '.third',
                name: '_'
            })
            .call(function() {
                gm.compare('webdrivercss/hideUsingCssSelectors._.baseline.png', 'test/fixtures/hideElem.png', function (err, isEqual, equality, raw) {
                    should.not.exist(err);
                    equality.should.be.within(0, 0.0001);
                    isEqual.should.be.equal(true);
                    done();
                });
            });
    });

    it('should exclude constantly changing content using xPath selectors', function(done) {
        this.browser
            .url(testurlThree)
            .webdrivercss('hideUsingXPath', {
                elem: '//html/body/section',
                hide: '//html/body/section',
                name: '_'
            })
            .call(function() {
                gm.compare('webdrivercss/hideUsingXPath._.baseline.png', 'test/fixtures/hideElem.png', function (err, isEqual, equality, raw) {
                    should.not.exist(err);
                    equality.should.be.within(0, 0.0001);
                    isEqual.should.be.equal(true);
                    done();
                });
            });
    });

    after(afterHook);

});
