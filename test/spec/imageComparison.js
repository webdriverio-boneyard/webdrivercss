describe('WebdriverCSS compares images and exposes information about CSS regression', function() {

    var capturingData = {
        elem: '.yellow',
        width: 550,
        height: 102
    }

    before(function(done) {
        // init plugin
        var plugin = WebdriverCSS.init(this.browser);

        this.browser
            .init()
            .url(testurl)
            .windowHandleSize({ width: 800, height: 600 })
            .webdrivercss('comparisonTest', capturingData)
            .call(done);
    });

    describe('should take a screenshot of same area without any changes in it', function(done) {

        before(function(done) {
            this.browser
                .webdrivercss('comparisonTest', capturingData)
                .call(done);
        });

        it('should exist an image (*.current.png) in the default image folder', function(done) {
            fs.exists('webdrivercss/comparisonTest.current.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should NOT exist an image (*.new.png) in the default image folder', function(done) {
            fs.exists('webdrivercss/comparisonTest.new.png', function(exists) {
                exists.should.equal(false);
                done();
            });
        });

        it('should NOT exist an image (*.diff.png) in the default failed comparisons image folder', function(done) {
            fs.exists('webdrivercss/diff/comparisonTest.diff.png', function(exists) {
                exists.should.equal(false);
                done();
            });
        });

    });

    describe('should change something within given area to do an image diff', function() {

        var resultObject = {};

        before(function(done) {
            this.browser
                .execute(function() {
                    document.querySelector('.green').style.backgroundColor = 'white';
                    document.querySelector('.black').style.backgroundColor = 'white';
                },[])
                .webdrivercss('comparisonTest', capturingData, function(err,res) {
                    should.not.exist(err);
                    resultObject = res;
                })
                .call(done);
        });

        it('should exist an image (*.current.png) in the default image folder', function(done) {
            fs.exists('webdrivercss/comparisonTest.current.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should exist an image (*.new.png) in the default image folder', function(done) {
            fs.exists('webdrivercss/comparisonTest.new.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should exist an image (*.diff.png) in the default failed comparisons image folder', function(done) {
            fs.exists('webdrivercss/diff/comparisonTest.diff.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should exist an *.diff image with same dimension', function() {
            resultObject.isSameDimensions.should.be.a('boolean');
            resultObject.isSameDimensions.should.equal(true);
        });

        it('should have an mismatch percentage of 35.65%', function() {
            resultObject.misMatchPercentage.should.be.a('number');
            resultObject.misMatchPercentage.should.equal(35.65);
        });

    });

    describe('should take a screenshot of same area without any changes in it again', function(done) {

        before(function(done) {
            this.browser
                .webdrivercss('comparisonTest', capturingData)
                .call(done);
        });

        it('should exist an image (*.current.png) in the default image folder', function(done) {
            fs.exists('webdrivercss/comparisonTest.current.png', function(exists) {
                exists.should.equal(true);
                done();
            });
        });

        it('should NOT exist an image (*.new.png) in the default image folder', function(done) {
            fs.exists('webdrivercss/comparisonTest.new.png', function(exists) {
                exists.should.equal(false);
                done();
            });
        });

        it('should NOT exist an image (*.diff.png) in the default failed comparisons image folder', function(done) {
            fs.exists('webdrivercss/diff/comparisonTest.diff.png', function(exists) {
                exists.should.equal(false);
                done();
            });
        });

    });

});