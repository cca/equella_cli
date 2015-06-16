// take /api/ off end of URLs, support for older .equellarc URL form
// we will add back /api/ later if we're passing onto an API route
module.exports = function (str) {
    // ends in /api/ or /api
    if (str.match(/api\/?$/)) {
        return str.replace(/api\/?$/, '')
    // doesn't end in /
    } else if (!str.match(/\/$/)) {
        return str + '/'
    } else {
        return str
    }
}
