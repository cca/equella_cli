var req = require('../lib/req')
var xpath = require('xpath')
var dom = require('xmldom').DOMParser
// @todo implement item endpoint, see:
// apidocs.do#!/item

module.exports = function (options) {
    var xp = options.x || options.xp

    if (xp) {
        return req(options, function (err, resp, data) {
            // item XML, minus system-generated stuff, is in "metadata" property
            var xml = new dom().parseFromString(data[0].metadata)
            var output = xpath.select(xp, xml).toString()
            console.log(output)
        })
    } else {
        return req(options)
    }
}
