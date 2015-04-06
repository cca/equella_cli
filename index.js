var path = require('path')
var req = require(path.join(process.cwd(), 'lib', 'req'))
var endpoints = require(path.join(process.cwd(), 'endpoints', 'hash'))

// main exported module
var eq = function (options) {
    // do we have an endpoint shortcut for the first arg?
    if (endpoints[options._[0]] !== undefined) {
        options.endpoint = endpoints[options._[0]]
        options.path = options.path || options._[1]
    } else {
        // else default to first arg is whole endpoint
        options.endpoint = options.endpoint || options._[0]
    }

    switch (options.endpoint) {
        case 'collection/':
            require(path.join(process.cwd(), 'endpoints', 'collection'))(options)
            break
        case 'taxonomy':
            require(path.join(process.cwd(), 'endpoints', 'taxonomy'))(options)
            break
        case 'usermanagement/local/group/':
            require(path.join(process.cwd(), 'endpoints', 'group'))(options)
            break
        case 'usermanagement/local/role/':
            require(path.join(process.cwd(), 'endpoints', 'role'))(options)
            break
        case 'usermanagement/local/user/':
            require(path.join(process.cwd(), 'endpoints', 'user'))(options)
            break
        // fall back to raw URL mode
        default:
            req(options)
    }
}

module.exports = eq
