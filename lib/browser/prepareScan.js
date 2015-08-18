/**
 * prepare scan process for saveDocumentScreenshot
 */
module.exports = function() {
    /**
     * remove scrollbars
     */
    document.body.style.overflow = 'hidden';

    /**
     * scroll back to start scanning
     */
    window.scrollTo(0, 0);

    /**
     * get viewport width/height and total width/height
     */
    return {
        screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight
    };
};