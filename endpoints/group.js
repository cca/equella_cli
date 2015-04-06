var path = require('path')
var req = require(path.join(process.cwd(), 'lib', 'req'))

module.exports = function (options) {
    if (options.name) {
        options.path = '?name=' + options.name
        req(options, function (err, resp, data) {
            if (err) throw err

            var id = data.results[0] && data.results[0].id

            if (!id) {
                return console.error('Unable to find group named "%s"', options.name)
            } else {
                var newOptions = options
                // rather than print group search result, get the group itself
                newOptions.path = id
                return req(newOptions)
            }
        })
    } else {
        return req(options)
    }
}
