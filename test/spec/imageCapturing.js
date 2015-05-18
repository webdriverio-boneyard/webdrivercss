describe('WebdriverCSS captures desired parts of a website as screenshot with specific dimension', function() {

    before(function(done) {

        this.browser = WebdriverIO.remote(capabilities);

        // init plugin
        WebdriverCSS.init(this.browser);

        this.browser
            .init()
            .url(testurl)
            .windowHandleSize({ width: 800, height: 600 })
            .call(done);

    });

    describe('should do a screenshot of a whole website if nothing specified', function(done) {

        var documentHeight = 0;

        before(function(done) {
            this.browser
                .webdrivercss('testWithoutParameter', { name: 'withoutParams'})
                .execute(function(){
                    return document.body.clientHeight;
                }, function(err,res) {
                    documentHeight = res.value;
                })
                .call(done);
        });

        it('should exist an image in the default image folder', function(done) {
            fs.exists('webdrivercss/testWithoutParameter.withoutParams.baseline.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should have the size of browser dimension', function(done) {
            gm('webdrivercss/testWithoutParameter.withoutParams.baseline.png').size(function(err,size) {
                should.not.exist(err);
                size.width.should.be.equal(800);
                // It's not clear why image height is slightly different from document height in
                // some environments. See issue #76.
                size.height.should.be.within(documentHeight - 20, documentHeight);
                done();
            });
        });

        it('should equal to fixture image', function(done) {
            gm.compare('webdrivercss/testWithoutParameter.withoutParams.baseline.png', 'test/fixtures/testWithoutParameter.current.png', function (err, isEqual, equality, raw) {
                should.not.exist(err);
                isEqual.should.be.equal(true);
                done();
            });
        });

    });

    describe('should do a screenshot with specific width and height values', function(done) {

        before(function(done) {
            this.browser
                .webdrivercss('testWithWidthHeightParameter', {
                    name: '_',
                    x: 100,
                    y: 100,
                    width: 100,
                    height: 100
                })
                .call(done);
        });

        it('should exist an image in the default image folder', function(done) {
            fs.exists('webdrivercss/testWithWidthHeightParameter._.baseline.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should have same size like given parameter', function(done) {
            gm('webdrivercss/testWithWidthHeightParameter._.baseline.png').size(function(err,size) {
                should.not.exist(err);
                size.width.should.be.equal(100);
                size.height.should.be.equal(100);
                done();
            });
        });

        it('should equal to fixture image', function(done) {
            gm.compare('webdrivercss/testWithWidthHeightParameter._.baseline.png', 'test/fixtures/testWithWidthHeightParameter.current.png', function (err, isEqual, equality, raw) {
                should.not.exist(err);
                isEqual.should.be.equal(true);
                done();
            });
        });

    });

    describe('should do a screenshot of a given element', function(done) {

        before(function(done) {
            this.browser
                .webdrivercss('testWithGivenElement', {
                    elem: '.red',
                    name: '_'
                })
                .call(done);
        });

        it('should exist an image in the default image folder', function(done) {
            fs.exists('webdrivercss/testWithGivenElement._.baseline.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should have the size of given element', function(done) {
            gm('webdrivercss/testWithGivenElement._.baseline.png').size(function(err,size) {
                should.not.exist(err);
                size.width.should.be.equal(102);
                size.height.should.be.equal(102);
                done();
            });
        });

        it('should equal to fixture image', function(done) {
            gm.compare('webdrivercss/testWithGivenElement._.baseline.png', 'test/fixtures/testWithGivenElement.current.png', function (err, isEqual, equality, raw) {
                should.not.exist(err);
                isEqual.should.be.equal(true);
                done();
            });
        });

    });

    describe('should do a screenshot of multiple elements', function(done) {
        var optsArrayOrig = [
            {
                elem: '.red',
                name: 'red'
            }, {
                elem: '.green',
                name: 'green'
            }];
        var optsArrayClone = JSON.parse(JSON.stringify(optsArrayOrig));

        before(function(done) {
            this.browser
                .webdrivercss('testWithMultipleElement', optsArrayClone)
                .call(done);
        });

        it('should exist two images in the default image folder', function(done) {
            fs.existsSync('webdrivercss/testWithMultipleElement.png').should.equal(true);
            fs.existsSync('webdrivercss/testWithMultipleElement.red.baseline.png').should.equal(true);
            fs.existsSync('webdrivercss/testWithMultipleElement.green.baseline.png').should.equal(true);
            done();
        });

        it('should not change the array passed in', function(done) {
            optsArrayClone.should.deep.equal(optsArrayOrig);
            done();
        });

    });

    describe('should do a screenshot of a given element with given width/height', function(done) {

        var documentHeight = 0;

        before(function(done) {
            this.browser
                .webdrivercss('testWithGivenElementAndWidthHeight', {
                    elem: '.yellow',
                    name: '_',
                    width: 550,
                    height: 102
                })
                .call(done);
        });

        it('should exist an image in the default image folder', function(done) {
            fs.exists('webdrivercss/testWithGivenElementAndWidthHeight._.baseline.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should have the size of given element', function(done) {
            gm('webdrivercss/testWithGivenElementAndWidthHeight._.baseline.png').size(function(err,size) {
                should.not.exist(err);
                size.width.should.be.equal(550);
                size.height.should.be.equal(102);
                done();
            });
        });

        it('should equal to fixture image', function(done) {
            gm.compare('webdrivercss/testWithGivenElementAndWidthHeight._.baseline.png', 'test/fixtures/testWithGivenElementAndWidthHeight.current.png', function (err, isEqual, equality, raw) {
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
                    height: 50,
                    name: '_'
                })
                .call(done);
        });

        it('should exist an image in the default image folder', function(done) {
            fs.exists('webdrivercss/testAtSpecificPosition._.baseline.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should have same size like given parameter', function(done) {
            gm('webdrivercss/testAtSpecificPosition._.baseline.png').size(function(err,size) {
                should.not.exist(err);
                size.width.should.be.equal(230);
                size.height.should.be.equal(50);
                done();
            });
        });

        it('should equal to fixture image', function(done) {
            gm.compare('webdrivercss/testAtSpecificPosition._.baseline.png', 'test/fixtures/testAtSpecificPosition.current.png', function (err, isEqual, equality, raw) {
                should.not.exist(err);
                isEqual.should.be.equal(true);
                done();
            });
        });

    });

    describe('should capture areas which are not within viewport', function() {

        it('using elem option', function(done) {

            this.browser
                .url(testurlTwo)
                .webdrivercss('notWithinViewportElem', {
                    elem: '.iamdownhere',
                    name: '_'
                })
                .call(function() {
                    gm.compare('webdrivercss/notWithinViewportElem._.baseline.png', 'test/fixtures/notWithinViewport.png', function (err, isEqual, equality, raw) {
                        should.not.exist(err);
                        isEqual.should.be.equal(true);
                        done();
                    });
                });

        });

        it('using xy coordinates', function(done) {

            this.browser
                .url(testurlTwo)
                .webdrivercss('notWithinViewportXY', {
                    x: 3000,
                    y: 3295,
                    width: 80,
                    height: 40,
                    name: '_'
                })
                .call(function() {
                    gm.compare('webdrivercss/notWithinViewportXY._.baseline.png', 'test/fixtures/notWithinViewport.png', function (err, isEqual, equality, raw) {
                        should.not.exist(err);
                        isEqual.should.be.equal(true);
                        done();
                    });
                });

        });

    });

    after(afterHook);

});
