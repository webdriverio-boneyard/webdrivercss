describe('WebdriverCSS should remove parts of websites to ignore changing content', function() {

    before(function(done) {

        this.browser = WebdriverIO.remote(capabilities);

        // init plugin
        WebdriverCSS.init(this.browser);

        this.browser
            .init()
            .windowHandleSize({ width: 800, height: 600 })
            .call(done);

    });

    it('should remove constantly changing content using CSS selectors', function(done) {
        this.browser
            .url(testurlThree)
            .webdrivercss('removeUsingCssSelectors', {
                elem: '#third',
                remove: '.third',
                name: '_'
            })
            .call(function() {
                gm.compare('webdrivercss/removeUsingCssSelectors._.baseline.png', 'test/fixtures/hideElem.png', function (err, isEqual, equality, raw) {
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
            .webdrivercss('removeUsingXPath', {
                elem: '//html/body/section',
                remove: '//html/body/section/div',
                name: '_'
            })
            .call(function() {
                gm.compare('webdrivercss/removeUsingXPath._.baseline.png', 'test/fixtures/hideElem.png', function (err, isEqual, equality, raw) {
                    should.not.exist(err);
                    equality.should.be.within(0, 0.0001);
                    isEqual.should.be.equal(true);
                    done();
                });
            });
    });

    after(afterHook);

});
