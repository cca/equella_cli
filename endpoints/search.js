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

module.exports = function (options) {
    // initialize as we'll use this repeatedly below
    options.path = options.path || '?'

    // free-text query string
    var query = options.query || options.q
    if (query) {
        options.path += 'q=' + encodeURIComponent(query)
    }

    // start
    // number of the record to start with

    // length
    // number returned results

    // collections
    // list of collection UUIDs to search

    // ordering principle of returned results
    var orderString = options.order || options.o
    if (orderString) {
        if (order.hasOwnProperty(orderString)) {
            options.path += 'order' + order[orderString]
        } else {
            // see handle-error fn for why syntax is like this
            return handle(null, {
                'error': true,
                'error_description': 'unrecognized "order" value: ' + orderString +
                    '\nplease choose one of: modified, name, rating, relevance'
            })
        }
    }

    // XML query, e.g. "WHERE /xml/mods/titleInfo/title LIKE 'Crime and*'"
    var where = options.where || options.w
    if (where) {
        options.path += 'where=' + encodeURIComponent(where)
    }

    // info     {basic,metadata,attachment,detail,navigation,drm,all}
    // level & type of information results should have

    // a Boolean indicating whether non-live resources are shown, default false
    if (options.showall || options.all || options.show) {
        options.path += 'showall=true'
    }

    return req(options)
}
