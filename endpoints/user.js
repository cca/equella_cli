var path = require('path')
var req = require(path.join(process.cwd(), 'lib', 'req'))
var handle = require(path.join(process.cwd(), 'lib', 'handle-error'))

module.exports = function (options) {
    var query = options.name || options.q

    // @todo should this be another findByName call?
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
