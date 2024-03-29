import {req} from'../lib/req.js'

export default function (options) {
    var query = options.name || options.q

    // TODO can't use findByName b/c user objects have "username" property & not "name"
    // could refactor findByName to be flexible in this circumstance
    if (query) {
        options.path = '?q=' + query
        return req(options, function ( data) {
            if (data.results.length === 0) {
                console.error(`Unable to find "${options.name}" in list of users`)
                return process.exit(1)
            }

            // only print 1st result
            // TODO if 2 users begin with the same stem will this cause problems?
            // e.g. q = eric => data.results = [{eric2}, {eric}]
            return console.log(JSON.stringify(data.results[0], null, 2))
        })
    } else {
        return req(options)
    }
}
