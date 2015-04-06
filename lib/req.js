var request = require('request')
var fs = require('fs')
var makeURL = function(options) {
    return options.root + options.endpoint + (options.path || '')
}

module.exports = function(options, cb) {
    if (!cb) {
        // default callback: pretty print JSON to stdout
        cb = function (err, resp, data) {
            if (err) throw err

            return console.log(JSON.stringify(data, null, 2))
        }
    }

    // log request URLs for debugging purposes
    if (options.debug) {
        console.error('Requesting %s', makeURL(options))
    }

    if (options.method === 'put' || options.method === 'post') {
        if (!options.data && !options.d && !options.file && !options.f) {
            return console.error('Error! Must provide data with --data or -d flags when using PUT or POST methods.')
        } else {
            var body = null

            // does it look like we were passed a path to a JSON file?
            if (options.data.match(/\.json$/) || options.file) {
                body = fs.readFileSync(options.data || options.file, {encoding: 'utf-8'})
            } else {
                body = options.data
            }

            return request[options.method](makeURL(options), {
                'body': body,
                'headers': {
                    'X-Authorization': 'access_token=' + options.token,
                    'Content-Type': 'application/json'
                }
            })
        }
    } else {
        return request[options.method](makeURL(options), {
            'headers': { 'X-Authorization': 'access_token=' + options.token },
            'json': options.json || true
        }, cb)
    }
}
