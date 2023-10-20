// common pattern in EQUELLA API usage:
// - given full set of options, send search request expecting multiple results
// - filter over results to find (case insensitive) name match
// - then request API info about that name, if found
import { req } from './req.js'
import { plural } from './plural.js'
import { handle } from './handle-error.js'

export function findByName(options) {
    // By default, some API routes (taxonomy, collection) only return a few
    // objects and our search will fail if the one we're looking for isn't
    // included. Instead, we request a high number to ensure we see them all.
    options.querystring = options.querystring || {}
    options.querystring.length = 5000

    // support usage like eq tax --name 'Taxo to delete' --method del
    if (options.method !== 'get') {
        options.original_method = options.method
        options.method = 'get'
    }

    req(options, function(err, resp, data) {
        handle(err, data)

        let object = data.results.filter(function(obj) {
            return obj.name.toLowerCase() === options.name.toLowerCase()
        })[0]

        if (object === undefined) {
            return console.error(
                'Unable to find %s in list of %s',
                options.name,
                plural(options.endpoint)
            )
        } else {
            let newOpts = options
            if (options.original_method) newOpts.method = options.original_method
            // also support an appended string e.g. {{uuid}}/term/ for taxo
            // these will always need a preceding slash
            if (options.append && options.append.indexOf('/') !== 0) {
                options.append = '/'.concat(options.append)
            }
            // some objects use uuid (e.g. taxonomy) while some use id (e.g. group)
            newOpts.path = (object.uuid || object.id) + (options.append || '')

            return req(newOpts)
        }
    })
}
