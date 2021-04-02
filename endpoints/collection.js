const req = require('../lib/req')
const findByName = require('../lib/find-by-name')

module.exports = function (options) {
    if (options.name) {
        return findByName(options)
    }

    // neither path nor privilege provided
    if (!options.privilege && !options.path && !options.p) {
        // so we default to VIEW_ITEM privilege
        options.privilege = 'VIEW_ITEM'
    }
    // convert privilege to path
    options.path = options.path || ('?privilege=' + options.privilege)

    return req(options)
}
