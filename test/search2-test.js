const s2 = require('../endpoints/search2.js')

const defaults = {
    // short length & no attachments to speed up response times
    length: 1,
    includeAttachment: false,
    collections: 'e1722640-f782-4a53-b20d-cda384f1aa22', // Test Collection UUID
    method: 'get',
    root: 'https://vault.cca.edu',
    endpoint: '/api/search2/', // have to add /api because its normally added by cli.js
}
const opts = require('rc')('equella', defaults)

// tests a few standard things we expect from every search API response
function testSuccessfulSearch(test, err, resp, data) {
    test.ok(err === null, 'no http error')
    test.ok(resp.statusCode === 200, 'status code is 200')
    test.ok(typeof data.available === 'number', 'response data.available is a number')
    test.ok(Array.isArray(data.results), 'response data.results is an array')
    test.done()
}

exports['basic query search works'] = function (test) {
    let o = opts
    o.query = 'test'
    s2(o, (e, r, d) => testSuccessfulSearch(test, e, r, d))
}

exports['single mimeTypes parameter works'] = function (test) {
    let o = opts
    o.mimeTypes = 'image/jpeg'
    s2(o, (e, r, d) => testSuccessfulSearch(test, e, r, d))
}

exports['multiple mimeTypes parameters work'] = function (test) {
    let o = opts
    // multiple mime types
    o.mimeTypes = 'image/jpeg,image/png'
    s2(o, (e, r, d) => testSuccessfulSearch(test, e, r, d))
}

exports['single musts parameter works'] = function (test) {
    let o = opts
    o.musts = 'realthumb:false'
    s2(o, (e, r, d) => testSuccessfulSearch(test, e, r, d))
}

exports['multiple musts parameters work'] = function (test) {
    let o = opts
    // multiple musts
    o.musts = 'realthumb:true,videothumb:true'
    s2(o, (e, r, d) => testSuccessfulSearch(test, e, r, d))
}

exports['CSV export works'] = function (test) {
    let o = opts
    o.export = true
    s2(o, function (err, resp, data) {
        test.ok(err === null)
        test.ok(resp.statusCode === 200)
        test.ok(resp.headers['content-type'] === 'text/csv')
        test.ok(data.length > 0)
        test.ok(data.match(','))
        test.done()
    })
}
