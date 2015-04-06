var path = require('path')
var req = require(path.join(process.cwd(), 'lib', 'req'))
var findByName = require(path.join(process.cwd(), 'lib', 'find-by-name'))

// @todo tax/{{uuid}}/search — see apidocs.do#!/taxonomy/searchTaxonomyTerms_get_15
// @todo above with restriction, limit, & searchfullterm params
module.exports = function (options) {
    if (options.name) {
        return findByName(options)
    } else {
        return req(options)
    }
}
