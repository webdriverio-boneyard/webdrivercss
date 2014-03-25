describe('WebdriverCSS should exclude parts of websites to ignore changing content', function() {

    before(function(done) {

        this.browser = WebdriverJS.remote(capabilities);

        // init plugin
        WebdriverCSS.init(this.browser);

        this.browser
            .init()
            .windowHandleSize({ width: 800, height: 600 })
            .call(done);

    });

    it('should generate diff image on constantly changing example content', function(done) {
        this.browser
            .url(testurlTwo)
            .webdrivercss('constantlyChanging', {
                elem: '.page'
            })
            .webdrivercss('constantlyChanging', {
                elem: '.page'
            })
            .call(function() {
                glob('webdrivercss/diff/constantlyChanging.diff.png', function(err,files) {
                    should.not.exist(err);
                    files.should.have.length(1);
                    done();
                });
            });
    });

    it('should exclude constantly changing content using CSS selectors', function(done) {
        this.browser
            .url(testurlTwo)
            .webdrivercss('excludeUsingCssSelectors', {
                elem: '.page',
                exclude: '.page'
            })
            .webdrivercss('excludeUsingCssSelectors', {
                elem: '.page',
                exclude: '.page'
            })
            .call(function() {
                glob('webdrivercss/diff/excludeUsingCssSelectors.diff.png', function(err,files) {
                    should.not.exist(err);
                    files.should.have.length(0);
                    done();
                });
            });
    });

    it('should exclude constantly changing content using single xy rectangle', function(done) {
        this.browser
            .url(testurlTwo)
            .webdrivercss('excludeUsingXYParameters', {
                elem: '.page',
                exclude: {
                    x0: 0,
                    x1: 230,
                    y0: 60,
                    y1: 295
                }
            })
            .webdrivercss('excludeUsingXYParameters', {
                elem: '.page',
                exclude: {
                    x0: 0,
                    x1: 230,
                    y0: 60,
                    y1: 295
                }
            })
            .call(function() {
                glob('{webdrivercss/excludeUsingXYParameters.*,webdrivercss/diff/excludeUsingXYParameters.*}', function(err,files) {
                    should.not.exist(err);
                    expect(files).to.contain('webdrivercss/excludeUsingXYParameters.current.png');
                    expect(files).not.to.contain('webdrivercss/diff/excludeUsingXYParameters.diff.png');
                    expect(files).not.to.contain('webdrivercss/excludeUsingXYParameters.new.png');
                    done();
                });
            });
    });

    it('should exclude constantly changing content using multiple xy rectangles', function(done) {
        this.browser
            .url(testurlTwo)
            .webdrivercss('excludeMultipleXYParameters', {
                elem: '.page',
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
                }]
            })
            .call(function() {
                glob('{webdrivercss/excludeMultipleXYParameters.*,webdrivercss/diff/excludeMultipleXYParameters.*}', function(err,files) {
                    should.not.exist(err);
                    expect(files).to.contain('webdrivercss/excludeMultipleXYParameters.current.png');
                    expect(files).not.to.contain('webdrivercss/diff/excludeMultipleXYParameters.diff.png');
                    expect(files).not.to.contain('webdrivercss/excludeMultipleXYParameters.new.png');
                    done();
                });
            });
    });

    it('should exclude constantly changing content using multiple xy points', function(done) {
        this.browser
            .url(testurlTwo)
            .webdrivercss('excludeMultipleXYPoints', {
                elem: '.page',
                exclude: [{
                    x0: 0,
                    y0: 60,
                    x1: 115,
                    y1: 60,
                    x2: 115,
                    y2: 295,
                    x3: 0,
                    y3: 115
                }, {
                    x0: 115,
                    y0: 60,
                    x1: 230,
                    y1: 60,
                    x2: 230,
                    y2: 295,
                    x3: 115,
                    y3: 295
                }]
            })
            .call(function() {
                glob('{webdrivercss/excludeMultipleXYPoints.*,webdrivercss/diff/excludeMultipleXYPoints.*}', function(err,files) {
                    should.not.exist(err);
                    expect(files).to.contain('webdrivercss/excludeMultipleXYPoints.current.png');
                    expect(files).not.to.contain('webdrivercss/diff/excludeMultipleXYPoints.diff.png');
                    expect(files).not.to.contain('webdrivercss/excludeMultipleXYPoints.new.png');
                    done();
                });
            });
    });

    after(afterHook);

});