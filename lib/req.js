import fetch, {Headers} from 'node-fetch'
import { readFileSync } from 'node:fs'
import * as qs from 'node:querystring'
import { handle } from './handle-error.js'

const makeURL = function(options) {
    return options.root + options.endpoint + (options.path || '') + (options.querystring ? `?${qs.stringify(options.querystring)}`: '')
}
// default callback: pretty print JSON to stdout
const defaultCb = data => console.log(JSON.stringify(data, null, 2))
const postOrPutCb = (url, status) => {
    if (url) return console.log(url)
    // TODO REST API doesn't return an err or body upon success? check status here?
    return console.log(status)
}

export const req = function (options, cb) {
    // log request URLs for debugging purposes
    if (options.debug) {
        console.error('%s %s', options.method.toUpperCase(), makeURL(options))
    }

    // ? does Accept mess with POST/PUT requests?
    let headers = new Headers({ 'Accept': 'application/json', 'X-Authorization': 'access_token=' + options.token })

    if (options.endpoint.match(/search2\/$/) && options.path === 'export') {
        headers.set('Accept', 'text/csv')
        if (!cb) cb = console.log
    }

    if (!cb) cb = defaultCb

    if (options.method === 'put' || options.method === 'post') {
        if (!options.data && !options.d && !options.file && !options.f) {
            console.error('Error! Must provide data with --data/-d or --file/-f flags when using PUT or POST methods.')
            return process.exit(1)
        } else {
            options.data = options.d || options.file || options.f || options.data
            const body = readFileSync(options.data)
            headers.set('Content-Type', 'application/json')

            return fetch(makeURL(options), {
                // need to send string & not buffer
                body: body.toString(),
                method: options.method,
                headers: headers
                // when new item is created we only know its URL from a response HTTP header
            }).then(resp => postOrPutCb(resp.headers.get('location'), resp.status))
                .catch(err => handle(err))
        }
    } else if (options.method === 'delete' || options.method === 'del') {
        // delete method doesn't return a body, just a status code
        return fetch(makeURL(options), {
            headers: headers,
            method: 'delete'
        }).then(resp => {
            if (resp.status === 204) {
                console.log(`Deleted ${resp.url}`)
            }
        }).catch(err => handle(err))
    } else {
        return fetch(makeURL(options), {
            headers: headers,
            method: 'get' // TODO support HEAD & OPTIONS
        }).then(resp => {
            // could be JSON or text for search2's CSV export
            if (resp.headers.get('content-type').match(/application\/json/)) return resp.json()
            return resp.text()
        }).then(data => cb(data))
            .catch(err => handle(err))
    }
}
