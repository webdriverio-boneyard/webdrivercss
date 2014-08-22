/*jshint -W030 */

describe('WebdriverCSS plugin as WebdriverIO enhancement', function() {

    before(function(done) {
        this.browser = WebdriverIO.remote(capabilities).init(done);
    });

    it('should not exist as command in WebdriverIO instance without initialization', function() {
        should.not.exist(this.browser.webdrivercss);
    });

    it('should not have any created folder before initialization', function(done) {
        fs.exists('webdrivercss', function(exists) {
            exists.should.be.equal(false);
            done();
        });
    });

    it('should throw an error on initialization without passing WebdriverIO instance', function() {
        expect(WebdriverCSS.init).to.throw(Error, 'A WebdriverIO instance is needed to initialise WebdriverCSS');
    });

    it('should be initialized without errors', function() {
        WebdriverCSS.init(this.browser).should.not.throw;
    });

    it('should enhance WebdriverIO instance with "webdrivercss" command after initialization', function() {
        should.exist(this.browser.webdrivercss);
    });

    it('should contain some default values', function() {
        var plugin = WebdriverCSS.init(this.browser);

        expect(plugin).to.have.property('screenshotRoot').to.equal('webdrivercss');
        expect(plugin).to.have.property('failedComparisonsRoot').to.equal('webdrivercss/diff');
        expect(plugin).to.have.property('misMatchTolerance').to.equal(0.05);

    });

    it('should contain some custom values', function() {
        var plugin = WebdriverCSS.init(this.browser, {
            screenshotRoot: '__screenshotRoot__',
            failedComparisonsRoot: '__failedComparisonsRoot__',
            misMatchTolerance: 50
        });

        expect(plugin).to.have.property('screenshotRoot').to.equal('__screenshotRoot__');
        expect(plugin).to.have.property('failedComparisonsRoot').to.equal('__failedComparisonsRoot__');
        expect(plugin).to.have.property('misMatchTolerance').to.equal(50);
    });

    it('should have a created "screenshotRoot" folder after initialization', function(done) {
        fs.exists('__screenshotRoot__', function(exist) {
            exist.should.be.equal(true);
            done();
        });
    });

    it('should have a created "failedComparisonsRoot" folder after initialization', function(done) {
        fs.exists('__failedComparisonsRoot__', function(exist) {
            exist.should.be.equal(true);
            done();
        });
    });

    after(afterHook);

});
