import fs from 'fs-extra'
import merge from 'deepmerge'

import workflow from './workflow.js'
import viewportScreenshot from './viewportScreenshot.js'
import documentScreenshot from './documentScreenshot.js'
import syncImages from './syncImages'

const DEFAULT_PROPERTIES = {
    screenshotRoot: 'webdrivercss',
    failedComparisonsRoot: 'webdrivercss/diff',
    misMatchTolerance: 0.05,
    screenWidth: [],
    warning: [],
    resultObject: {},
    updateBaseline: false
}

/**
 * WebdriverCSS
 * initialise plugin
 */
class WebdriverCSS {
    constructor (webdriverInstance, options) {
        if (!webdriverInstance) {
            throw new Error('A WebdriverIO instance is needed to initialise WebdriverCSS')
        }

        this.instance = webdriverInstance
        this.options = merge(DEFAULT_PROPERTIES, options || {})

        /**
        * create directory if it doesn't already exist
        */
        this.createDirectory(this.options.screenshotRoot)
        this.createDirectory(this.options.failedComparisonsRoot)

        /**
         * add WebdriverCSS command to WebdriverIO instance
         */
        this.instance.addCommand('saveViewportScreenshot', viewportScreenshot.bind(this))
        this.instance.addCommand('saveDocumentScreenshot', documentScreenshot.bind(this))
        this.instance.addCommand('webdrivercss', workflow.bind(this))
        this.instance.addCommand('sync', syncImages.bind(this))
    }

    createDirectory (path) {
        if (fs.existsSync(path)) {
            return
        }

        fs.mkdirsSync(path, '0755', true)
    }
}

/**
 * expose WebdriverCSS
 */
module.exports.init = (webdriverInstance, options) => new WebdriverCSS(webdriverInstance, options)
