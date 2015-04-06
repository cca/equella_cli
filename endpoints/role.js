var path = require('path')
var req = require(path.join(process.cwd(), 'lib', 'req'))
var handle = require(path.join(process.cwd(), 'lib', 'handle-error'))

module.exports = function (options) {
    if (options.name) {
        options.path = 'name/' + options.name
        req(options, function (err, resp, data) {
            handle(err, data)

            console.log(JSON.stringify(data, null, 2))
        })
    } else {
        req(options)
    }
}
