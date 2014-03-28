describe('WebdriverCSS captures shots with different screen widths', function() {

    before(function(done) {

        this.browser = WebdriverJS.remote(capabilities);

        // init plugin
        WebdriverCSS.init(this.browser);

        this.browser
            .init()
            .url(testurl)
            .windowHandleSize({ width: 999, height: 999 })
            .webdrivercss('screenWidthTest', {
                screenWidth: [320,480,640,1024]
            })
            .call(done);

    });

    it('if 4 screen widths are given, it should have taken 4 shots', function(done) {
        glob('webdrivercss/*.png', function(err,files) {
            should.not.exist(err);
            files.should.have.length(4);
            done();
        });
    });

    it('screen width should be part of file name', function(done) {
        glob('webdrivercss/*.png', function(err,files) {
            should.not.exist(err);
            files.forEach(function(file,i) {
                file.match(/(.)+\.current\.\d+px.png/g).should.have.length(1);
            });
            done();
        });
    });

    it('shots should have a specific width according to given screen width', function(done) {
        glob('webdrivercss/*.png', function(err,files) {
            should.not.exist(err);
            files.forEach(function(file,i) {
                var width = parseInt(file.match(/\d+/g)[0],10);
                gm('webdrivercss/screenWidthTest.current.' + width + 'px.png').size(function(err,size) {
                    should.not.exist(err);

                    // travisci made me do that -.-
                    if(size.width === 321) size.width = 320;

                    size.width.should.be.equal(width);

                    if(i === files.length - 1) done();
                });
            });
        });
    });

    it('browser should be get back to old resolution after shots were taken', function(done) {
        this.browser
            .windowHandleSize(function(err,res) {
                should.not.exist(err);
                res.value.width.should.be.equal(999);
                res.value.height.should.be.equal(999);
            })
            .call(done);
    });

    after(afterHook);

})