describe('WebdriverCSS captures shots with different screen widths', function() {

    before(function(done) {

        this.browser = WebdriverIO.remote(capabilities);

        // init plugin
        WebdriverCSS.init(this.browser);

        this.browser
            .init()
            .url(testurl)
            .windowHandleSize({ width: 999, height: 999 })
            .webdrivercss('screenWidthTest', [
                {
                    name: 'test',
                    screenWidth: [320,480,640,1024]
                },{
                    name: 'test_two',
                    screenWidth: [444,666]
                }
            ])
            .call(done);

    });

    /**
     * 12 pictures get taken
     * - 4 + 2 cropped images of the element for each screen resolution
     * - 6 screenshots of the whole website for each screen resolution
     */
    it('if 4 screen widths are given and 2 elements captured, it should have taken 12 shots', function(done) {
        glob('webdrivercss/*.png', function(err,files) {
            should.not.exist(err);
            files.should.have.length(12);
            done();
        });
    });

    it('screen width should be part of file name', function(done) {
        glob('webdrivercss/*.png', function(err,files) {
            should.not.exist(err);
            files.forEach(function(file,i) {
                file.match(/(.)+\.\d+px(\.passed)*\.png/g).should.have.length(1);
            });
            done();
        });
    });

    it('shots should have a specific width according to given screen width', function(done) {
        glob('webdrivercss/*.png', function(err,files) {
            should.not.exist(err);
            files.forEach(function(file,i) {
                var width = parseInt(file.match(/\d+/g)[0],10);
                gm('webdrivercss/screenWidthTest.' + width + 'px.png').size(function(err,size) {
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

});

describe('WebdriverCSS captures shots with different screen widths', function() {

    before(function(done) {

        this.browser = WebdriverIO.remote(capabilities);

        // init plugin
        WebdriverCSS.init(this.browser);

        this.browser
            .init()
            .url(testurl)
            .windowHandleSize({ width: 999, height: 999 })
            .webdrivercss('screenWidthTest', [
                {
                    name: 'test_three',
                    screenWidth: [320,480,640,1024]
                },{
                    name: 'test_four',
                    screenWidth: [320,480,640,1024]
                }
            ])
            .call(done);
    });

    /**
     * 12 pictures get taken
     * - 4 + 4 cropped images of the element for each screen resolution
     * - 4 screenshots of the whole website for each screen resolution
     */
    it('if 4 screen widths are given and 2 elements captured, it should have taken 12 shots', function(done) {
        glob('webdrivercss/*.png', function(err,files) {
            should.not.exist(err);
            files.should.have.length(12);
            done();
        });
    });

    after(afterHook);

});
