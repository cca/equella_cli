import { toISO8601 } from '../lib/iso8601.js'
import { list } from '../lib/list.js'
import { req } from '../lib/req.js'
import { handle } from '../lib/handle-error.js'

// order translation hash, allow some shortcuts
const ORDER_OPTIONS = {
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
const INFO_OPTIONS = {
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
// valid statuses
const STATUS_OPTIONS = {
    archived: 'ARCHIVED',
    deleted: 'DELETED',
    draft: 'DRAFT',
    live: 'LIVE',
    moderating: 'MODERATING',
    personal: 'PERSONAL',
    published: 'LIVE',
    rejected: 'REJECTED',
    review: 'REVIEW',
    suspended: 'SUSPENDED',
}

export default function (options) {
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
        if (len > 50) {
            len = 50
            console.error('The "length" parameter was reset to 50, the maximum.')
        }
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
        if (Object.hasOwn(ORDER_OPTIONS, orderString)) {
            options.path += '&order=' + ORDER_OPTIONS[orderString]
        } else {
            // see handle-error fn for why syntax is like this
            return handle(null, {
                'error': true,
                'error_description': `Unrecognized "order" value: ${orderString}
Please choose one of: ${list(Object.keys(ORDER_OPTIONS), 'or')}.`
            })
        }
    }

    // XML query, e.g. "WHERE /xml/mods/titleInfo/title LIKE 'Crime and*'"
    let where = options.where || options.w
    if (where) {
        // prepend /xml if it's not already present because it's required
        if (where.indexOf('/xml') === -1) {
            where = where.charAt('/') !== '/' ? '/xml/' + where : '/xml' + where
        }
        options.path += '&where=' + encodeURIComponent(where)
    }

    // level & type of information results should have
    let infoString = options.info || options.i || 'basic'
    let infos = infoString.split(',')
    if (infos.length) {
        if (infos.every(term => Object.hasOwn(INFO_OPTIONS, term))) {
            options.path += '&info=' + infos.map(term => INFO_OPTIONS[term]).join(',')
        } else {
            // see handle-error fn for why syntax is like this
            return handle(null, {
                'error': true,
                'error_description': `Unrecognized "info" value: ${infoString}
Please choose from: ${list(Object.keys(INFO_OPTIONS), 'and/or')}.`
            })
        }
    }

    // item statuses filter
    let statusString = options.status || options.s || null
    let statuses = statusString ? statusString.toLowerCase().split(',') : []
    if (statuses.length) {
        if (statuses.every(status => Object.hasOwn(STATUS_OPTIONS, status))) {
            options.path += '&status=' + statuses.map(status => STATUS_OPTIONS[status]).join(',')
        } else {
            // see handle-error fn for why syntax is like this
            return handle(null, {
                'error': true,
                'error_description': `Unrecognized "status" value: ${statusString}\nPlease choose from: ${list(Object.keys(STATUS_OPTIONS), 'and/or')}.`
            })
        }
    }

    // last modified dates
    let modifiedAfter = options.modifiedAfter || options.ma
    let modifiedBefore = options.modifiedBefore || options.mb
    if (modifiedAfter) {
        options.path += '&modifiedAfter=' + encodeURIComponent(toISO8601(modifiedAfter))
    }
    if (modifiedBefore) {
        options.path += '&modifiedBefore=' + encodeURIComponent(toISO8601(modifiedBefore))
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
    if (!statusString && options.showall || options.all || options.show) {
        options.path += '&showall=true'
    }

    return req(options)
}
