var req = require('../lib/req')
var handle = require('../lib/handle-error')

module.exports = function (options) {
    // @todo can't use findByName because plain "role" endpt
    // just returns { "start": 0, "length": 23, "available": 23 }
    // with no results list! bug in EQUELLA API according to support 4/22/15
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
