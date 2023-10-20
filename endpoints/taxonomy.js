import { req } from'../lib/req.js'
import { findByName } from '../lib/find-by-name.js'

const makeSearchOptions = function (query, opts) {
    let restriction = opts.restriction || opts.restrict || 'UNRESTRICTED'

    // shorthands for the two other options
    if (opts.leaf) {
        restriction = 'LEAF_ONLY'
    } else if (opts.top) {
        restriction = 'TOP_LEVEL_ONLY'
    }

    let qs = new URLSearchParams({
        'q': query,
        'restriction': restriction.toUpperCase(),
        // default to searching full term unlike the API
        'searchfullterm': opts.fullterm || 'true',
        'limit': opts.limit || 20
    })

    return qs
}

/*
A note on options.path vs options.append: options.path comes after the API
route to a single object i.e. {root}/taxonomy/{UUID}/{path} while append is only
used if we first look up an object by its name, then after we find it append
becomes the path.
*/
export default function (options) {
    let search = (options.search || options.s || options.serach)
    options.append = options.append || ''
    if (options.method == 'get') options.path = options.path || ''
    // if we're using --name we put path things in append, if not we put them in
    // path, this abstracts over that
    let appendOrPath = options.name ? 'append' : 'path'

    if (search) {
        // putting search query string in append allows us to look up
        // the taxonomy by name first below
        options[appendOrPath] += '/search'
        options.qs = makeSearchOptions(search, options)
    } else if (options.term) {
        // support --term option to look up a term by its path
        // ignore if we're searching, can't do both at once
        if (typeof options.term === 'boolean') {
            console.error(
`Error: --term flag requires an argument. If you are not looking up a term by
its path, then try using --terms or eq tax $UUID/term instead.`
            )
            process.exit(1)
        }
        options[appendOrPath] += '/term'
        options.qs = new URLSearchParams({ 'path': options.term })
    } else if (options.terms) {
        options[appendOrPath] += '/term'
    }

    // tack query string onto path before making any requests
    if (options.qs) options[appendOrPath] += `?${options.qs.toString()}`

    if (options.name) return findByName(options)
    return req(options)
}
