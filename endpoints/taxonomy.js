var req = require('../lib/req')
var findByName = require('../lib/find-by-name')
var qs = require('querystring')
var makeSearchOptions = function (query, options) {
    var restriction = options.restriction || options.restrict || 'UNRESTRICTED'

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
    var search = (options.search || options.s || options.serach)

    if (search) {
        // putting search query string in append allows us to look up
        // the taxonomy by name first below
        options.append = 'search?'
        options.append += makeSearchOptions(search, options)
    } else if (options.term) {
        // support --term option to look up a term by its path
        // ignore if we're searching, can't do both at once
        options.append = 'term?path=' + options.term
    } else if (options.terms) {
        options.append = 'term'
    }

    if (options.name) {
        return findByName(options)
    } else {
        return req(options)
    }
}
