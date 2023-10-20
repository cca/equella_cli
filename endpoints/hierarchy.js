// TODO fully implement hierarchy endpoint, see:
// apidocs.do#!/hierarchy
import { req } from '../lib/req.js'
import { findByName } from '../lib/find-by-name.js'

export default function (options) {
    if (options.name) {
        return findByName(options)
    }

    return req(options)
}
