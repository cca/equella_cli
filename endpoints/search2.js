import { toISO8601 } from '../lib/iso8601.js'
import { list } from '../lib/list.js'
import { req } from '../lib/req.js'
import { handle } from '../lib/handle-error.js'
import { checkUUID } from '../lib/checkUUID.js'

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

export default function (options, cb) {
    // CSV export, this has special handling in lib/req.js to set the Accept header
    if (options.e || options.export) {
        options.path = 'export'
    }

    let qs = options.querystring = {}

    // free-text query string
    let query = options.query || options.q || ''
    qs.query = encodeURIComponent(query)

    // first record to return, e.g. for paging
    if (options.start) {
        qs.start = options.start
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
        qs.length = len
    }

    // list of collections' UUIDs you want to search
    let coll = options.collections || options.coll || options.c
    if (coll) {
        qs.collections = coll
    }

    // ordering principle of returned results
    let orderString = options.order || options.o
    if (orderString) {
        if (Object.hasOwn(ORDER_OPTIONS, orderString)) {
            qs.order = ORDER_OPTIONS[orderString]
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
        qs.whereClause = encodeURIComponent(where)
    }

    // level & type of information results should have
    let infoString = options.info || options.i || 'basic'
    let infos = infoString.split(',')
    if (infos.length) {
        if (infos.every(term => Object.hasOwn(INFO_OPTIONS, term))) {
            qs.info = infos.map(term => INFO_OPTIONS[term]).join(',')
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
            qs.status = statuses.map(status => STATUS_OPTIONS[status]).join(',')
        } else {
            // see handle-error fn for why syntax is like this
            return handle(null, {
                'error': true,
                'error_description': `Unrecognized "status" value: ${statusString}
Please choose from: ${list(Object.keys(STATUS_OPTIONS), 'and/or')}.`
            })
        }
    }

    // last modified dates
    let modifiedAfter = options.modifiedAfter || options.ma
    let modifiedBefore = options.modifiedBefore || options.mb
    if (modifiedAfter) {
        qs.modifiedAfter = encodeURIComponent(toISO8601(modifiedAfter))
    }
    if (modifiedBefore) {
        qs.modifiedBefore = encodeURIComponent(toISO8601(modifiedBefore))
    }

    // owner (usually the user who created the item)
    let owner = options.owner
    if (owner) {
        qs.owner = encodeURIComponent(owner)
    }

    let reverse = options.reverse || options.r
    if (reverse) {
        qs.reverseOrder = true
    }

    // searchAttachments defaults to true
    if (options.searchAttachments && options.searchAttachments.toLowerCase() === 'false') {
        qs.searchAttachments = false
    }

    // includeAttachments defaults to true
    if (options.includeAttachments && options.includeAttachments.toLowerCase() === 'false') {
        qs.includeAttachments = false
    }

    // advancedSearch
    if (options.advancedSearch) {
        // oE sends a helpful "no advanced search UUID matching..." error message
        // but we will also provide a bit of extra help
        if (!checkUUID(options.advancedSearch)) console.error('The --advancedSearch flag must be set to a valid power search UUID.\nTry `eq settings/advancedsearch` to see the full list.')
        qs.advancedSearch = encodeURIComponent(options.advancedSearch)
    }

    // mimeTypes and musts are both arrays so qs will serialize them as multiple
    // of the same parameter, e.g. mimeTypes=video/mp4&mimeTypes=video/ogg

    let mt = options.mimeTypes || options.mt
    if (mt) {
        // also does not work with encodeURIComponent
        qs.mimeTypes = mt.split(',').map(mt => encodeURI(mt))
    }

    if (options.musts) {
        // note: throws error "Provided 'musts' expression(s) was incorrectly formatted."
        // if you try to use encodeURIComponent
        qs.musts = options.musts.split(',').map(m => encodeURI(m))
    }

    // a Boolean indicating whether non-live resources are shown, default false
    if (!statusString && options.showall || options.all || options.show) {
        qs.showall = true
    }

    return req(options, cb)
}
