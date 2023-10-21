import { req } from '../lib/req.js'
// xpath is commonjs
import { select } from 'xpath'
import { DOMParser } from '@xmldom/xmldom'
// TODO more to implement in item endpoint, see: apidocs.do#!/item

export default function (options) {
    // xpath expression, if present
    let xp = options.x || options.xp

    if (xp) {
        return req(options, function (err, resp, data) {
            // --text flag means we want the text, not the XML node
            xp = (options.text ? xp + '/text()' : xp)
            let item = Array.isArray(data) ? data[0] : data
            // EQUELLA item XML, excluding system-generated stuff under /xml/item,
            // is all contained in the "metadata" property
            let xml = new DOMParser().parseFromString(item.metadata)
            console.log(select(xp, xml).toString())
        })
    } else {
        return req(options)
    }
}
