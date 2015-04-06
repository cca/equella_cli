var path = require('path')
var req = require(path.join(process.cwd(), 'lib', 'req'))

module.exports = function (options) {
    if (options.name) {
        options.path = 'name/' + options.name
        req(options, function (err, resp, data) {
            if (err) throw err
            if (data.error) {
                console.error(data.error_description)
                process.exit(1)
            }

            console.log(JSON.stringify(data, null, 2))
        })
    } else {
        req(options)
    }
}
