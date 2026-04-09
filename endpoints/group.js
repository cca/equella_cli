import { req } from '../lib/req.js'
import { findByName } from '../lib/find-by-name.js'

export default function (options, callback) {
    if (options.name) {
        return findByName(options, callback)
    } else {
        return req(options, callback)
    }
}
