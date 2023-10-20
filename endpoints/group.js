import { req } from '../lib/req.js'
import { findByName } from '../lib/find-by-name.js'

export default function (options) {
    if (options.name) {
        return findByName(options)
    } else {
        return req(options)
    }
}
