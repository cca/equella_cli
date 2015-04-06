// common pattern in EQUELLA API usage:
// - given full set of options, send search request expecting multiple results
// - filter over results to find (case insensitive) name match
// - then request API info about that name, if found
var path = require('path')
var req = require(path.join(process.cwd(), 'lib', 'req'))
var plural = require(path.join(process.cwd(), 'lib', 'plural'))

module.exports = function (options) {
    req(options, function(err, resp, data) {
        if (err) throw err

        var object = data.results.filter(function(obj) {
            return obj.name.toLowerCase() === options.name.toLowerCase()
        })[0]

        if (object === undefined) {
            return console.error(
                'Unable to find %s in list of %s',
                options.name,
                plural(options.endpoint))
        } else {
            var newOpts = options
            // some objects use uuid (e.g. taxonomy) while some use id (e.g. group)
            newOpts.path = object.uuid || object.id

            return req(newOpts)
        }
    })
}
