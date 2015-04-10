var req = require('../lib/req')
var handle = require('../lib/handle-error')

module.exports = function (options) {
    var query = options.name || options.q

    // @todo can't use findByName b/c user objects have "username" property & not "name"
    // could refactor findByName to be flexible in this circumstance
    if (query) {
        options.path = '?q=' + query
        return req(options, function (err, resp, data) {
            handle(err, data)

            if (data.results.length === 0) {
                return console.error('Unable to find', options.name, 'in list of users')
            }

            // only print 1st result
            // @todo: if 2 users begin with the same stem will this cause problems?
            // e.g. q = eric => data.results = [{eric2}, {eric}]
            return console.log(JSON.stringify(data.results[0], null, 2))
        })
    } else {
        return req(options)
    }
}
