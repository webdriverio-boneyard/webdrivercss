export function getPageInfo () {
    var body = document.body
    var html = document.documentElement

    /**
     * remove scrollbars
     * reset height in case we're changing viewports
     */
    body.style.height = 'auto'
    body.style.height = html.scrollHeight + 'px'
    body.style.overflow = 'hidden'

    /**
     * scroll back to start scanning
     */
    window.scrollTo(0, 0)

    /**
     * get viewport width/height and total width/height
     */
    var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)

    return {
        screenWidth: Math.max(html.clientWidth, window.innerWidth || 0),
        screenHeight: Math.max(html.clientHeight, window.innerHeight || 0),
        documentWidth: html.scrollWidth,
        documentHeight: height,
        devicePixelRatio: window.devicePixelRatio
    }
}
