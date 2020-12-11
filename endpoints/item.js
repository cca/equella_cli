const req = require('../lib/req')
const xpath = require('xpath')
const Dom = require('xmldom').DOMParser
// @todo more to implement in item endpoint, see:
// apidocs.do#!/item

module.exports = function (options) {
    // xpath expression, if present
    let xp = options.x || options.xp

    if (xp) {
        return req(options, function (err, resp, data) {
            // --text flag means we want the text, not the XML node
            xp = (options.text ? xp + '/text()' : xp)
            let item = Array.isArray(data) ? data[0] : data
            // EQUELLA item XML, excluding system-generated stuff under /xml/item,
            // is all contained in the "metadata" property
            let xml = new Dom().parseFromString(item.metadata)
            console.log(xpath.select(xp, xml).toString())
        })
    } else {
        return req(options)
    }
}
