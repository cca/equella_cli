var req = require('../lib/req')
var xpath = require('xpath')
var Dom = require('xmldom').DOMParser
// @todo more to implement in item endpoint, see:
// apidocs.do#!/item

module.exports = function (options) {
    // xpath expression, if present
    var xp = options.x || options.xp

    if (xp) {
        return req(options, function (err, resp, data) {
            // --text flag means we want the text, not the XML node
            xp = (options.text ? xp + '/text()' : xp)
            // EQUELLA item XML, excluding system-generated stuff under /xml/item,
            // is all contained in the "metadata" property
            var xml = new Dom().parseFromString(data[0].metadata)
            console.log(xpath.select(xp, xml).toString())
        })
    } else {
        return req(options)
    }
}
