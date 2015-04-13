var req = require('../lib/req')
var findByName = require('../lib/find-by-name')
// @todo implement browsehierarchy endpoint, see:
// apidocs.do#!/hierarchy-browse
module.exports = function (options) {
    if (options.name) {
        return findByName(options)
    } else {
        return req(options)
    }
}
