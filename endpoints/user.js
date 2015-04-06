var path = require('path')
var req = require(path.join(process.cwd(), 'lib', 'req'))

module.exports = function (options) {
    var query = options.name || options.q

    if (query) {
        options.path = '?q=' + query
        return req(options, function (err, resp, data) {
            if (err) throw err

            // only print 1st result
            // @todo: if 2 users begin with the same stem will this cause problems?
            // e.g. q = eric => data.results = [{eric2}, {eric}]
            return console.log(JSON.stringify(data.results[0], null, 2))
        })
    } else {
        return req(options)
    }
}
