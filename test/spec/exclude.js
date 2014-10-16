describe('WebdriverCSS should exclude parts of websites to ignore changing content', function() {

    before(function(done) {

        this.browser = WebdriverIO.remote(capabilities);

        // init plugin
        WebdriverCSS.init(this.browser);

        this.browser
            .init()
            .windowHandleSize({ width: 800, height: 600 })
            .call(done);

    });

    it('should generate diff image on constantly changing example content', function(done) {
        this.browser
            .url(testurlThree)
            .webdrivercss('constantlyChanging', {
                elem: '.third',
                name: '_'
            })
            .webdrivercss('constantlyChanging', {
                elem: '.third',
                name: '_'
            })
            .call(function() {
                glob('webdrivercss/diff/constantlyChanging._.diff.png', function(err,files) {
                    should.not.exist(err);
                    files.should.have.length(1);
                    done();
                });
            });
    });

    it('should exclude constantly changing content using CSS selectors', function(done) {
        this.browser
            .url(testurlThree)
            .webdrivercss('excludeUsingCssSelectors', {
                elem: '.third',
                exclude: '.third',
                name: '_'
            })
            .webdrivercss('excludeUsingCssSelectors', {
                elem: '.third',
                exclude: '.third',
                name: '_'
            })
            .call(function() {
                glob('webdrivercss/diff/excludeUsingCssSelectors._.diff.png', function(err,files) {
                    should.not.exist(err);
                    files.should.have.length(0);
                    done();
                });
            });
    });

    it('should exclude constantly changing content using xPath selectors', function(done) {
        this.browser
            .url(testurlThree)
            .webdrivercss('excludeUsingCssSelectors', {
                elem: '//html/body/div',
                exclude: '//html/body/div',
                name: '_'
            })
            .webdrivercss('excludeUsingCssSelectors', {
                elem: '//html/body/div',
                exclude: '//html/body/div',
                name: '_'
            })
            .call(function() {
                glob('webdrivercss/diff/excludeUsingCssSelectors._.diff.png', function(err,files) {
                    should.not.exist(err);
                    files.should.have.length(0);
                    done();
                });
            });
    });

    it('should exclude constantly changing content using single xy rectangle', function(done) {
        this.browser
            .url(testurlThree)
            .webdrivercss('excludeUsingXYParameters', {
                elem: '.third',
                exclude: {
                    x0: 0,
                    x1: 230,
                    y0: 60,
                    y1: 295
                },
                name: '_'
            })
            .webdrivercss('excludeUsingXYParameters', {
                elem: '.third',
                exclude: {
                    x0: 0,
                    x1: 230,
                    y0: 60,
                    y1: 295
                },
                name: '_'
            })
            .call(function() {
                glob('{webdrivercss/excludeUsingXYParameters.*,webdrivercss/diff/excludeUsingXYParameters._.*}', function(err,files) {
                    should.not.exist(err);
                    expect(files).to.contain('webdrivercss/excludeUsingXYParameters._.baseline.png');
                    expect(files).not.to.contain('webdrivercss/diff/excludeUsingXYParameters._.diff.png');
                    expect(files).not.to.contain('webdrivercss/excludeUsingXYParameters._.regression.png');
                    done();
                });
            });
    });

    it('should exclude constantly changing content using multiple xy rectangles', function(done) {
        this.browser
            .url(testurlThree)
            .webdrivercss('excludeMultipleXYParameters', {
                elem: '.third',
                exclude: [{
                    x0: 0,
                    x1: 115,
                    y0: 60,
                    y1: 295
                }, {
                    x0: 115,
                    x1: 230,
                    y0: 60,
                    y1: 295
                }],
                name: '_'
            })
            .webdrivercss('excludeMultipleXYParameters', {
                elem: '.third',
                exclude: [{
                    x0: 0,
                    x1: 115,
                    y0: 60,
                    y1: 295
                }, {
                    x0: 115,
                    x1: 230,
                    y0: 60,
                    y1: 295
                }],
                name: '_'
            })
            .call(function() {
                glob('{webdrivercss/excludeMultipleXYParameters.*,webdrivercss/diff/excludeMultipleXYParameters.*}', function(err,files) {
                    should.not.exist(err);
                    expect(files).to.contain('webdrivercss/excludeMultipleXYParameters._.baseline.png');
                    expect(files).not.to.contain('webdrivercss/diff/excludeMultipleXYParameters._.diff.png');
                    expect(files).not.to.contain('webdrivercss/excludeMultipleXYParameters._.regression.png');
                    done();
                });
            });
    });

    it('should exclude constantly changing content using multiple xy points', function(done) {
        this.browser
            .url(testurlThree)
            .webdrivercss('excludeMultipleXYPoints', {
                elem: '.third',
                exclude: [{
                    x0: 0,
                    y0: 60,
                    x1: 100,
                    y1: 60,
                    x2: 100,
                    y2: 260,
                    x3: 0,
                    y3: 260
                }, {
                    x0: 100,
                    y0: 60,
                    x1: 200,
                    y1: 60,
                    x2: 200,
                    y2: 260,
                    x3: 100,
                    y3: 260
                }],
                name: '_'
            })
            .webdrivercss('excludeMultipleXYPoints', {
                elem: '.third',
                exclude: [{
                    x0: 0,
                    y0: 60,
                    x1: 100,
                    y1: 60,
                    x2: 100,
                    y2: 260,
                    x3: 0,
                    y3: 260
                }, {
                    x0: 100,
                    y0: 60,
                    x1: 200,
                    y1: 60,
                    x2: 200,
                    y2: 260,
                    x3: 100,
                    y3: 260
                }],
                name: '_'
            })
            .call(function() {
                glob('{webdrivercss/excludeMultipleXYPoints.*,webdrivercss/diff/excludeMultipleXYPoints.*}', function(err,files) {
                    should.not.exist(err);
                    expect(files).to.contain('webdrivercss/excludeMultipleXYPoints._.baseline.png');
                    expect(files).not.to.contain('webdrivercss/diff/excludeMultipleXYPoints._.diff.png');
                    expect(files).not.to.contain('webdrivercss/excludeMultipleXYPoints._.regression.png');
                    done();
                });
            });
    });

    after(afterHook);

});
