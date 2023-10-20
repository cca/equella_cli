import { req } from '../lib/req.js'
import { findByName } from '../lib/find-by-name.js'

export default function (options) {
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
