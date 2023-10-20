import { req } from './lib/req.js'
import { endpoints } from './endpoints/hash.js'
import browsehierarchy from './endpoints/browsehierarchy.js'
import collection from './endpoints/collection.js'
import item from './endpoints/item.js'
import launcher from './endpoints/launcher.js'
import search from './endpoints/search.js'
import search2 from './endpoints/search2.js'
import settings from './endpoints/settings.js'
import taxonomy from './endpoints/taxonomy.js'
import group from './endpoints/group.js'
import role from './endpoints/role.js'
import user from './endpoints/user.js'

// main exported module
export const eq = function(options) {
    // do we have an endpoint shortcut for the first arg?
    if (endpoints[options._[0]] !== undefined) {
        options.endpoint = endpoints[options._[0]]
        // better handling of uses like `eq tax $UUID term` where multiple
        // arguments are strung together instead of using flags and only the
        // first arg is an endpoint
        if (options.path && options._.length > 1) {
            // tack any --path parameter onto the end of arguments
            options.path = options._.slice(1).concat(options.path).join('/')
        } else {
            options.path = options.path || options._.slice(1).join('/') || ''
        }
    } else {
        // else default to first arg is whole endpoint
        options.endpoint = options.endpoint || options._[0]
    }

    switch (options.endpoint) {
        case 'browsehierarchy/':
            browsehierarchy(options)
            break
        case 'collection/':
            collection(options)
            break
        case 'item/':
            item(options)
            break
        case 'launcher':
            launcher(options)
            break
        case 'search/':
            search(options)
            break
        case 'search2/':
            search2(options)
            break
        case 'settings':
            settings(options)
            break
        case 'taxonomy/':
            taxonomy(options)
            break
        case 'usermanagement/local/group/':
            group(options)
            break
        case 'usermanagement/local/role/':
            role(options)
            break
        case 'usermanagement/local/user/':
            user(options)
            break
        // fall back to raw URL mode
        default:
            req(options)
    }
}
