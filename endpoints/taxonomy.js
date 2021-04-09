const req = require('../lib/req')
const findByName = require('../lib/find-by-name')
const qs = require('querystring')
const makeSearchOptions = function (query, options) {
    let restriction = options.restriction || options.restrict || 'UNRESTRICTED'

    // shorthands for the two other options
    if (options.leaf) {
        restriction = 'LEAF_ONLY'
    } else if (options.top) {
        restriction = 'TOP_LEVEL_ONLY'
    }

    return qs.stringify({
        'q': query,
        // upper case since people might pass in lowercase on the cli
        'restriction': restriction.toUpperCase(),
        // default to searching full term, unlike the API
        'searchfullterm': options.fullterm || 'true',
        'limit': options.limit || 20
    })
}

module.exports = function (options) {
    let search = (options.search || options.s || options.serach)

    if (search) {
        // putting search query string in append allows us to look up
        // the taxonomy by name first below
        options.append = '/search?' + makeSearchOptions(search, options)
    } else if (options.term) {
        // support --term option to look up a term by its path
        // ignore if we're searching, can't do both at once
        options.append = '/term?path=' + options.term
    } else if (options.terms) {
        options.append = '/term'
    // conditions above imply we're using GET /taxonomy/ route, append a large
    // "length" parameter to ensure we get them all
    } else if (options.method == 'get' && !options.path) {
        options.path = '?length=5000'
    } else if (options.method == 'get' && !options.path.match(/\?length=/)) {
        options.path += '?length=5000'
    }

    if (options.name) {
        return findByName(options)
    } else {
        if (options.append) options.path += options.append
        return req(options)
    }
}
