/**
 * @return {string} A V4 UUID.
 * @private
 */
export function generateUUID () {
    let d = new Date().getTime()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16)
    })
}
