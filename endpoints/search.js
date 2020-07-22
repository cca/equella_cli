const req = require('../lib/req')
const handle = require('../lib/handle-error')
// @todo implement search endpoint, see:
// apidocs.do#!/search
// status are not implemented yet, follows the order/info validated format

// order translation hash, allow some shortcuts
const order = {
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
const info = {
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
    let query = options.query || options.q || ''
    options.path += 'q=' + encodeURIComponent(query)

    // first record to return, e.g. for paging
    if (options.start) {
        options.path += '&start=' + options.start
    }

    // number of results to retrieve
    let len = options.length || options.l
    // must be less than or equal to 50 so we don't need to validate
    // EQUELLA's error message is clear
    if (len) {
        if (len > 50) len = 50 && console.error('The "length" parameter was reset to 50, the maximum.')
        options.path += '&length=' + len
    }

    // list of collections' UUIDs you want to search
    let coll = options.collections || options.coll || options.c
    if (coll) {
        options.path += '&collections=' + coll
    }

    // ordering principle of returned results
    let orderString = options.order || options.o
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
    let where = options.where || options.w
    if (where) {
        options.path += '&where=' + encodeURIComponent(where)
    }

    // level & type of information results should have
    let infoString = options.info || options.i
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

    // last modified dates @TODO enforce ISO-8601 dates?
    let modifiedAfter = options.modifiedAfter || options.ma
    let modifiedBefore = options.modifiedBefore || options.mb
    if (modifiedAfter) {
        options.path += '&modifiedAfter=' + encodeURIComponent(modifiedAfter)
    }
    if (modifiedBefore) {
        options.path += '&modifiedBefore=' + encodeURIComponent(modifiedBefore)
    }

    // owner (usually the user who created the item)
    let owner = options.owner
    if (owner) {
        options.path += '&owner=' + encodeURIComponent(owner)
    }

    let reverse = options.reverse || options.r
    if (reverse) {
        options.path += '&reverse=true'
    }

    // a Boolean indicating whether non-live resources are shown, default false
    if (options.showall || options.all || options.show) {
        options.path += '&showall=true'
    }

    return req(options)
}
