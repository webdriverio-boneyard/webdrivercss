export function getScrollingPosition () {
    var position = [0, 0]

    if (typeof window.pageYOffset !== 'undefined') {
        return [window.pageXOffset, window.pageYOffset]
    } else if (typeof document.documentElement.scrollTop !== 'undefined' && document.documentElement.scrollTop > 0) {
        return [document.documentElement.scrollLeft, document.documentElement.scrollTop]
    } else if (typeof document.body.scrollTop !== 'undefined') {
        return [document.body.scrollLeft, document.body.scrollTop]
    }

    return position
}
