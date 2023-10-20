import request from 'request'
import { readFileSync } from 'node:fs'
import * as qs from 'node:querystring'
import { handle } from './handle-error.js'

const makeURL = function(options) {
    return options.root + options.endpoint + (options.path || '') + (options.querystring ? `?${qs.stringify(options.querystring)}`: '')
}
// default callback: pretty print JSON to stdout
const defaultCb = function(err, resp, data) {
    handle(err, data)

    return console.log(JSON.stringify(data, null, 2))
}
const postOrPutCb = function(err, resp, data) {
    // when new item is created we only know its URL from a response HTTP header
    if (resp.headers.location) console.log(resp.headers.location)
    // REST API doesn't return an err or body upon success?
    return handle(err, data)
}

export const req = function(options, cb) {
    let headers = { 'X-Authorization': 'access_token=' + options.token }

    if (!cb) cb = defaultCb

    // log request URLs for debugging purposes
    if (options.debug) {
        console.error('%s %s', options.method.toUpperCase(), makeURL(options))
    }

    // search2 endpoint's CSV export
    if (options.endpoint.match(/search2\/$/) && options.path === 'export') {
        headers['Accept'] = 'text/csv'
        options.json = false
    }

    if (options.method === 'put' || options.method === 'post') {
        if (!options.data && !options.d && !options.file && !options.f) {
            return console.error('Error! Must provide data with --data/-d or --file/-f flags when using PUT or POST methods.')
        } else {
            // TODO it'd be nice to be able to pass JSON text in a flag like
            // --data '{ "term": "taxonomy term" }'
            // as opposed to forcing people to use files
            options.data = options.d || options.file || options.f || options.data
            const body = readFileSync(options.data)
            headers['Content-Type'] = 'application/json'

            return request[options.method](makeURL(options), {
                // need to send string & not buffer
                body: body.toString(),
                headers: headers
            }, postOrPutCb)
        }
    } else if (options.method === 'delete') {
        // request foolishly doesn't use the actual HTTP method name but only a shorthand
        // here we alias it so it's more intuitive
        return request.del(makeURL(options), {
            headers: headers
        }, cb)
    } else {
        return request[options.method](makeURL(options), {
            headers: headers,
            json: options.json || true
        }, cb)
    }
}
