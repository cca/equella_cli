var path = require('path')
var req = require(path.join(process.cwd(), 'lib', 'req'))
var findByName = require(path.join(process.cwd(), 'lib', 'find-by-name'))

module.exports = function (options) {
    if (options.name) {
        return findByName(options)
    } else {
        return req(options)
    }
}
