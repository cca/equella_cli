var request = require('request')
var fs = require('fs')
var handle = require('./handle-error')
var makeURL = function(options) {
    return options.root + options.endpoint + (options.path || '')
}
// default callback: pretty print JSON to stdout
var defaultCb = function(err, resp, data) {
    handle(err, data)

    return console.log(JSON.stringify(data, null, 2))
}
var postOrPutCb = function(err, resp, data) {
    // REST API doesn't return an err or body upon success?
    return handle(err, data)
}

module.exports = function(options, cb) {
    if (!cb) cb = defaultCb

    // log request URLs for debugging purposes
    if (options.debug) {
        console.error('%s %s', options.method.toUpperCase(), makeURL(options))
    }

    if (options.method === 'put' || options.method === 'post') {
        if (!options.data && !options.d && !options.file && !options.f) {
            return console.error('Error! Must provide data with --data/-d or --file/-f flags when using PUT or POST methods.')
        } else {
            options.data = options.d || options.file || options.f
            var body = fs.readFileSync(options.data);

            return request[options.method](makeURL(options), {
                // need to send string & not buffer
                'body': body.toString(),
                'headers': {
                    'X-Authorization': 'access_token=' + options.token,
                    'Content-Type': 'application/json'
                }
            }, postOrPutCb)
        }
    } else if (options.method === 'delete') {
        // request foolishly doesn't use the actual HTTP method name but only a shorthand
        // here we alias it so it's more intuitive
        return request.del(makeURL(options), {
            'headers': { 'X-Authorization': 'access_token=' + options.token }
        }, cb)
    } else {
        return request[options.method](makeURL(options), {
            'headers': { 'X-Authorization': 'access_token=' + options.token },
            'json': options.json || true
        }, cb)
    }
}
