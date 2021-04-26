var req = require('./lib/req')
var endpoints = require('./endpoints/hash')

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
        case 'browsehierarchy/':
            require('./endpoints/browsehierarchy')(options)
            break
        case 'collection/':
            require('./endpoints/collection')(options)
            break
        case 'item/':
            require('./endpoints/item')(options)
            break
        case 'launcher':
            require('./endpoints/launcher')(options)
            break
        case 'search/':
            require('./endpoints/search')(options)
            break
        case 'settings':
            require('./endpoints/settings')(options)
            break
        case 'taxonomy/':
            require('./endpoints/taxonomy')(options)
            break
        case 'usermanagement/local/group/':
            require('./endpoints/group')(options)
            break
        case 'usermanagement/local/role/':
            require('./endpoints/role')(options)
            break
        case 'usermanagement/local/user/':
            require('./endpoints/user')(options)
            break
        // fall back to raw URL mode
        default:
            req(options)
    }
}

module.exports = eq
