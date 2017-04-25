/**
 *
 * Save a screenshot as a base64 encoded PNG with the current state of the browser.
 *
 * <example>
    :saveScreenshot.js
    client
        // set browser window size
        .windowHandleSize({width: 500, height: 500})
        .saveScreenshot('viewport.png') // make screenshot of current viewport (500x500px)
        .saveScreenshot('wholeScreen.png', true) // makes screenshot of whole document (1280x1342px)
        .end();
 * </example>
 *
 * @param {String}   fileName    path of generated image (relative to the execution directory)
 * @param {Boolean=} totalScreen if true (default value) it takes a screenshot of whole website, otherwise only of current viewport
 *
 * @uses protocol/execute, utility/scroll, protocol/screenshot
 * @type utility
 *
 */

import fs from 'fs'
import gm from 'gm'
import path from 'path'
import rimraf from 'rimraf'

import generateUUID from './helpers/generateUUID'
import scrollFn from './scripts/scroll'
import getPageInfo from './scripts/getPageInfo'

const CAPS_TAKING_FULLSIZE_SHOTS = ['firefox']

export default async function documentScreenshot (fileName) {
    let ErrorHandler = this.instance.ErrorHandler

    /*!
     * parameter check
     */
    if (typeof fileName !== 'string') {
        throw new ErrorHandler.CommandError(`filename from type string is require, got ${fileName}`)
    }

    let cropImages = []
    let currentXPos = 0
    let currentYPos = 0
    let screenshot = null

    /*!
     * create tmp directory to cache viewport shots
     */
    let uuid = generateUUID()
    let tmpDir = path.join(__dirname, '..', '.tmp-' + uuid)
    // Todo: promisify this
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, '0755')
    }

    /*!
     * prepare page scan
     */
    const pageInfo = (await this.execute(getPageInfo)).value

    /**
     * no need to stitch viewports together if screenshot is from the whole website
     */
    if (CAPS_TAKING_FULLSIZE_SHOTS.indexOf(this.browserName) === -1) {
        const screenshot = await this.saveScreenshot(fileName)
        return screenshot
    }

    /*!
     * run scan
     */
    while (currentXPos < (pageInfo.documentWidth / pageInfo.screenWidth)) {
        /*!
         * take screenshot of viewport
         */
        let shot = await this.screenshot()

        /*!
         * cache viewport image into tmp dir
         */
        let file = tmpDir + '/' + currentXPos + '-' + currentYPos + '.png'
        let gmImage = gm(new Buffer(shot.value, 'base64'))

        if (pageInfo.devicePixelRatio > 1) {
            var percent = 100 / pageInfo.devicePixelRatio
            gmImage.resize(percent, percent, '%')
        }

        gmImage.crop(pageInfo.screenWidth, pageInfo.screenHeight, 0, 0)

        if (!cropImages[currentXPos]) {
            cropImages[currentXPos] = []
        }

        cropImages[currentXPos][currentYPos] = file

        currentYPos++
        if (currentYPos > Math.floor(pageInfo.documentHeight / pageInfo.screenHeight)) {
            currentYPos = 0
            currentXPos++
        }

        await new Promise((resolve) => gmImage.write(file, resolve))

        /*!
         * scroll to next area
         */
        await this.execute(scrollFn,
            currentXPos * pageInfo.screenWidth,
            currentYPos * pageInfo.screenHeight
        )

        /**
         * have a small break to allow browser to render
         */
        await this.pause(50)
    }

    /*!
     * concats all shots
     */
    var subImg = 0

    for (let snippet in cropImages) {
        var col = gm(snippet.shift())
        col.append.apply(col, snippet)

        if (!screenshot) {
            screenshot = col
            await new Promise((resolve) => col.write(fileName, resolve))
        } else {
            await new Promise((resolve) =>
                col.write(tmpDir + '/' + (++subImg) + '.png', () =>
                    gm(fileName).append(tmpDir + '/' + subImg + '.png', true).write(fileName, resolve)
            ))
        }
    }

    /*!
     * crop screenshot regarding page size
     */
    await new Promise((resolve) =>
        gm(fileName).crop(pageInfo.documentWidth, pageInfo.documentHeight, 0, 0).write(fileName, resolve))

    /*!
     * remove tmp dir
     * Todo: promisify
     */
    rimraf.sync(tmpDir)

    /*!
     * scroll back to start position
     */
    await this.execute(scrollFn, 0, 0)
}
