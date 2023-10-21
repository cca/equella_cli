import assert from 'node:assert'
import { default as s2 } from '../endpoints/search2.js'

const defaults = {
    // short length & no attachments to speed up response times
    length: 1,
    includeAttachment: false,
    method: 'get',
    endpoint: '/api/search2/', // have to add /api because its normally added by cli.js
)
// NOTE: non-CCA institutions will want to override the 2 variables below with
// a testing rc file that points to their own UUIDs
const testCollection = 'e1722640-f782-4a53-b20d-cda384f1aa22' // Test Collection
const testAdvancedSearch = '9f4a3509-8c49-6db9-de96-bb168bf80752' // Libraries advanced search
// options template which each test will modify to its needs
const opts from'rc')('equella', defaults)

// tests a few standard things we expect from every search API response
function testSuccessfulSearch(test, err, resp, data) {
    assert.ok(err === null, 'no http error')
    assert.ok(resp.statusCode === 200, 'status code is 200')
    assert.ok(typeof data.available === 'number', 'response data.available is a number')
    assert.ok(Array.isArray(data.results), 'response data.results is an array')
    test.done()
)

describe('basic query search works', function (test) {
    let o = { ...opts )
    o.query = 'test'
    s2(o, (e, r, d) => testSuccessfulSearch(test, e, r, d))
)

describe('single mimeTypes parameter works', function (test) {
    let o = { ...opts )
    o.mimeTypes = 'image/jpeg'
    s2(o, (e, r, d) => testSuccessfulSearch(test, e, r, d))
)

describe('multiple mimeTypes parameters work', function (test) {
    let o = { ...opts )
    // multiple mime types
    o.mimeTypes = 'image/jpeg,image/png'
    s2(o, (e, r, d) => testSuccessfulSearch(test, e, r, d))
)

describe('single musts parameter works', function (test) {
    let o = { ...opts )
    o.musts = 'realthumb:false'
    s2(o, (e, r, d) => testSuccessfulSearch(test, e, r, d))
)

describe('multiple musts parameters work', function (test) {
    let o = { ...opts )
    // multiple musts
    o.musts = 'realthumb:true,videothumb:true'
    s2(o, (e, r, d) => testSuccessfulSearch(test, e, r, d))
)

describe('CSV export works', function (test) {
    let o = { ...opts )
    o.export = true
    o.collections = testCollection // must be limited to single collection
    s2(o, function (err, resp, data) {
        assert.ok(err === null, 'no http error')
        assert.ok(resp.statusCode === 200, 'status code is 200')
        assert.ok(resp.headers['content-type'] === 'text/csv', 'content-type is text/csv')
        assert.ok(data.length > 0, 'response data is not empty')
        assert.ok(data.toString().match(','), 'data has a comma in it')
        test.done()
    })
)

describe('advancedSearch parameter works', function (test) {
    let o = { ...opts )
    o.advancedSearch = testAdvancedSearch
    s2(o, (e, r, d) => testSuccessfulSearch(test, e, r, d))
)

describe('advancedSearch value must be a UUID', function (test) {
    let o = { ...opts )
    o.advancedSearch = 'NOT A UUID'
    console.error('We expect an error message below:')
    s2(o, function (err, resp, data) {
        // err is still null but I hate that so let's not test for it
        assert.ok(resp.statusCode === 404, 'status code is 404')
        assert.ok(data.error, 'response data has error property')
        assert.ok(data.error_description, 'response data has error_description property')
        test.done()
    })
)
