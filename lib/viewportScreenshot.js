/**
 * takes screenshot of the current viewport
 *
 * @param {String} filename  path of file to be saved
 */

import gm from 'gm'
import ErrorHandler from 'webdriverio/lib/utils/ErrorHandler'

import getScrollingPosition from './scripts/getScrollingPosition'
import getScreenDimension from './scripts/getScreenDimension'

export default async function viewportScreenshot (fileName) {
    /*!
     * parameter check
     */
    if (typeof fileName !== 'string') {
        throw new ErrorHandler.CommandError('number or type of arguments don\'t agree with saveScreenshot command')
    }

    /*!
     * get page information like
     * - scroll position
     * - viewport width/height and total width/height
     */
    let scrollPosition = await this.execute(getScrollingPosition)
    let screenDimension = await this.execute(getScreenDimension)

    /**
     * take screenshot
     */
    let screenshot = await this.screenshot()

    /**
     * crop image
     */
    return await new Promise((resolve, reject) => {
        gm(new Buffer(screenshot.value, 'base64')).crop(
            // width
            screenDimension.value.screenWidth,
            // height
            screenDimension.value.screenHeight,
            // top
            scrollPosition.value[0],
            // left
            scrollPosition.value[1]
        ).write(fileName, (err) => {
            if (err) {
                return reject(err)
            }

            return resolve()
        })
    })
}
