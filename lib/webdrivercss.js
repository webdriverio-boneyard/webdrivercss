/**
 * WebdriverCSS
 */

var fs    = require('fs'),
    gm    = require('gm'),
    async = require('async');

var WebdriverCSS = module.exports = function(webdriverInstance, options) {
    options = options || {};

    if(!webdriverInstance) {
        throw new Error('A WebdriverJS instance is needed to initialise WebdriverCSS');
    }

    var that = this;

    this.webdriverInstance = webdriverInstance;
    this.screenshotRoot = options.screenshotRoot || 'webdrivercss';
    this.failedComparisonsRoot = options.failedComparisonsRoot || this.screenshotRoot + '/failures';
    this.mismatchTolerance = options.mismatchTolerance || 0.05;

    /**
     * create directory structure
     */
     if(!fs.existsSync('./' + this.screenshotRoot)){
        fs.mkdirSync('./' + this.screenshotRoot, 0766, function(err){
            if(err) throw new Error("ERROR! Can't make the directory! \n");
        });
     }

    /**
     * add WebdriverCSS command to WebdriverJS instance
     */
    this.webdriverInstance.addCommand('webdrivercss', function(id,args,cb) {
        var filename = id + '.png',
            screenshot, pageInfo;

        async.waterfall([
            
            /**
             * create screenshot via [GET] /session/:sessionId/screenshot
             */
            function(done) {
                that.webdriverInstance.screenshot(done)
            },

            /**
             * get page informations
             */
            function(res,done) {
                screenshot = new Buffer(res.value, 'base64');

                if(!args.elem) {
                    return done(null);
                }

                that.webdriverInstance.execute(function() {
                    return {
                        screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                        screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                        elemBounding: (arguments[0] && document.querySelector(arguments[0])) ? document.querySelector(arguments[0]).getBoundingClientRect() : null,
                        url: window.location.href
                    }
                },args.elem,done)
            },

            function(res, done) {

                if(res.value.elemBounding) {

                    var cropDim = {
                        x: args.x || (res.value.elemBounding.left + (res.value.elemBounding.width / 2)),
                        y: args.y || (res.value.elemBounding.top + (res.value.elemBounding.height / 2)),
                        width: args.width || res.value.elemBounding.width,
                        height: args.height || res.value.elemBounding.height
                    }

                    gm(screenshot)
                        .quality(100)
                        .crop(cropDim.width, cropDim.height, cropDim.x - (cropDim.width / 2), cropDim.y - (cropDim.height / 2))
                        .write(filename, done);
                
                } else {
                    gm(screenshot).quality(100).write(filename, done);
                }
            }
        ])
    })

}

WebdriverCSS.prototype