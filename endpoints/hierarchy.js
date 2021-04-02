// @todo fully implement hierarchy endpoint, see:
// apidocs.do#!/hierarchy
const req = require('../lib/req')
const findByName = require('../lib/find-by-name')

console.log('hierarchy route')
module.exports = function (options) {
    if (options.name) {
        return findByName(options)
    }

    return req(options)
}
