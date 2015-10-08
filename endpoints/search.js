var req = require('../lib/req')
var handle = require('../lib/handle-error')
// @todo implement search endpoint, see:
// apidocs.do#!/search

// order translation hash, allow some shortcuts
var order = {
    alpha: 'name',
    date: 'modified',
    mod: 'modified',
    modified: 'modified',
    name: 'name',
    nm: 'name',
    rating: 'rating',
    rel: 'relevance',
    relevance: 'relevance',
    star: 'rating',
    stars: 'rating',
    title: 'name'
}
// same but for info parameter
var info = {
    all: 'all',
    attachment: 'attachment',
    basic: 'basic',
    detail: 'detail',
    drm: 'drm',
    evil: 'drm',
    file: 'attachment',
    files: 'attachment',
    md: 'metadata',
    metadata: 'metadata',
    nav: 'navigation',
    navigation: 'navigation',
    xml: 'metadata'
}

module.exports = function (options) {
    // initialize as we'll use this repeatedly below
    options.path = options.path || '?'

    // free-text query string
    var query = options.query || options.q || ''
    options.path += 'q=' + encodeURIComponent(query)

    // first record to return, e.g. for paging
    if (options.start) {
        options.path += '&start=' + options.start
    }

    // number of results to retrieve
    var len = options.length || options.l
    // must be less than or equal to 50 but we don't need to validate
    // EQUELLA's error message is clear
    if (len) {
        options.path += '&length=' + len
    }

    // list of collections' UUIDs you want to search
    var coll = options.collections || options.coll || options.c
    if (coll) {
        options.path += '&collections=' + coll
    }

    // ordering principle of returned results
    var orderString = options.order || options.o
    if (orderString) {
        if (order.hasOwnProperty(orderString)) {
            options.path += '&order=' + order[orderString]
        } else {
            // see handle-error fn for why syntax is like this
            return handle(null, {
                'error': true,
                'error_description': 'unrecognized "order" value: ' + orderString +
                    '\nplease choose one of: modified, name, rating, or relevance'
            })
        }
    }

    // XML query, e.g. "WHERE /xml/mods/titleInfo/title LIKE 'Crime and*'"
    var where = options.where || options.w
    if (where) {
        options.path += '&where=' + encodeURIComponent(where)
    }

    // level & type of information results should have
    var infoString = options.info || options.i
    if (infoString) {
        if (info.hasOwnProperty(infoString)) {
            options.path += '&info=' + info[infoString]
        } else {
            // see handle-error fn for why syntax is like this
            return handle(null, {
                'error': true,
                'error_description': 'unrecognized "info" value: ' + orderString +
                    '\nplease choose one of: basic, metadata, attachment, detail, navigation, drm, or all'
            })
        }
    }

    // a Boolean indicating whether non-live resources are shown, default false
    if (options.showall || options.all || options.show) {
        options.path += '&showall=true'
    }

    return req(options)
}
