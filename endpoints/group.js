var req = require('../lib/req')
var findByName = require('../lib/find-by-name')

module.exports = function (options) {
    if (options.name) {
        return findByName(options)
    } else {
        return req(options)
    }
}
