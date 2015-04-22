// common pattern in EQUELLA API usage:
// - given full set of options, send search request expecting multiple results
// - filter over results to find (case insensitive) name match
// - then request API info about that name, if found
var req = require('./req')
var plural = require('./plural')
var handle = require('./handle-error')

module.exports = function (options) {
    req(options, function(err, resp, data) {
        handle(err, data)

        var object = data.results.filter(function(obj) {
            return obj.name.toLowerCase() === options.name.toLowerCase()
        })[0]

        if (object === undefined) {
            return console.error(
                'Unable to find %s in list of %s',
                options.name,
                plural(options.endpoint)
            )
        } else {
            var newOpts = options
            // also support an appended string e.g. {{uuid}}/term/ for taxo
            // these will always need a preceding slash
            if (options.append && options.append.indexOf('/') !== 0) {
                options.append = '/'.concat(options.append)
            }
            // some objects use uuid (e.g. taxonomy) while some use id (e.g. group)
            newOpts.path = (object.uuid || object.id) + (options.append || '')

            return req(newOpts)
        }
    })
}
