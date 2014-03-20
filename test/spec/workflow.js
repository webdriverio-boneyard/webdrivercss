describe.only('WebdriverCSS as plugin to do CSS regression testing', function() {

    before(function(done) {
        // init plugin
        var plugin = WebdriverCSS.init(this.browser);

        this.browser
            .init()
            .url(testurl)
            .windowHandleSize({ width: 800, height: 600 })
            .call(done);
    })

    describe('should do a screenshot of a whole website if nothing specified', function(done) {

        var documentHeight = 0;

        before(function(done) {
            this.browser
                .webdrivercss('testWithoutParameter')
                .execute(function(){
                    return document.body.clientHeight;
                }, function(err,res) {
                    documentHeight = res.value;
                })
                .call(done);
        });

        it('should exist an image in the default image folder', function(done) {
            fs.exists('webdrivercss/testWithoutParameter.current.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should have the size of browser dimension', function(done) {
            gm('webdrivercss/testWithoutParameter.current.png').size(function(err,size) {
                should.not.exist(err);
                size.width.should.be.equal(800);
                size.height.should.be.equal(documentHeight);
                done();
            });
        });

        it('should equal to fixture image', function(done) {
            gm.compare('webdrivercss/testWithoutParameter.current.png', 'test/fixtures/testWithoutParameter.current.png', function (err, isEqual, equality, raw) {
                should.not.exist(err);
                isEqual.should.be.equal(true);
                done();
            });
        });

    });

    describe('should do a screenshot with specific width and height values', function(done) {

        var documentHeight = 0;

        before(function(done) {
            this.browser
                .webdrivercss('testWithWidthHeightParameter', {
                    x: 100,
                    y: 100,
                    width: 100,
                    height: 100
                })
                .call(done);
        });

        it('should exist an image in the default image folder', function(done) {
            fs.exists('webdrivercss/testWithWidthHeightParameter.current.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should have same size like given parameter', function(done) {
            gm('webdrivercss/testWithWidthHeightParameter.current.png').size(function(err,size) {
                should.not.exist(err);
                size.width.should.be.equal(100);
                size.height.should.be.equal(100);
                done();
            });
        });

        it('should equal to fixture image', function(done) {
            gm.compare('webdrivercss/testWithWidthHeightParameter.current.png', 'test/fixtures/testWithWidthHeightParameter.current.png', function (err, isEqual, equality, raw) {
                should.not.exist(err);
                isEqual.should.be.equal(true);
                done();
            });
        });

    });

    describe('should do a screenshot of a given element', function(done) {

        var documentHeight = 0;

        before(function(done) {
            this.browser
                .webdrivercss('testWithGivenElement', {
                    elem: '.red'
                })
                .call(done);
        });

        it('should exist an image in the default image folder', function(done) {
            fs.exists('webdrivercss/testWithGivenElement.current.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should have the size of given element', function(done) {
            gm('webdrivercss/testWithGivenElement.current.png').size(function(err,size) {
                should.not.exist(err);
                size.width.should.be.equal(102);
                size.height.should.be.equal(102);
                done();
            });
        });

        it('should equal to fixture image', function(done) {
            gm.compare('webdrivercss/testWithGivenElement.current.png', 'test/fixtures/testWithGivenElement.current.png', function (err, isEqual, equality, raw) {
                should.not.exist(err);
                isEqual.should.be.equal(true);
                done();
            });
        });

    });

    describe('should do a screenshot of a given element with given width/height', function(done) {

        var documentHeight = 0;

        before(function(done) {
            this.browser
                .webdrivercss('testWithGivenElementAndWidthHeight', {
                    elem: '.yellow',
                    width: 550,
                    height: 102
                })
                .call(done);
        });

        it('should exist an image in the default image folder', function(done) {
            fs.exists('webdrivercss/testWithGivenElementAndWidthHeight.current.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should have the size of given element', function(done) {
            gm('webdrivercss/testWithGivenElementAndWidthHeight.current.png').size(function(err,size) {
                should.not.exist(err);
                size.width.should.be.equal(550);
                size.height.should.be.equal(102);
                done();
            });
        });

        it('should equal to fixture image', function(done) {
            gm.compare('webdrivercss/testWithGivenElementAndWidthHeight.current.png', 'test/fixtures/testWithGivenElementAndWidthHeight.current.png', function (err, isEqual, equality, raw) {
                should.not.exist(err);
                isEqual.should.be.equal(true);
                done();
            });
        });

    });

    describe('should do a screenshot at specific x,y position with specific width,height', function(done) {

        var documentHeight = 0;

        before(function(done) {
            this.browser
                .webdrivercss('testAtSpecificPosition', {
                    x: 15,
                    y: 15,
                    width: 230,
                    height: 50
                })
                .call(done);
        });

        it('should exist an image in the default image folder', function(done) {
            fs.exists('webdrivercss/testAtSpecificPosition.current.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should have same size like given parameter', function(done) {
            gm('webdrivercss/testAtSpecificPosition.current.png').size(function(err,size) {
                should.not.exist(err);
                size.width.should.be.equal(230);
                size.height.should.be.equal(50);
                done();
            });
        });

        it('should equal to fixture image', function(done) {
            gm.compare('webdrivercss/testAtSpecificPosition.current.png', 'test/fixtures/testAtSpecificPosition.current.png', function (err, isEqual, equality, raw) {
                should.not.exist(err);
                isEqual.should.be.equal(true);
                done();
            });
        });

    });

})