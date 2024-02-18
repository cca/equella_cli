import assert from 'node:assert'
import { default as s2 } from '../endpoints/search2.js'

const defaults = {
    // short length & no attachments to speed up response times
    length: 1,
    includeAttachment: false,
    method: 'get',
    endpoint: '/api/search2/', // have to add /api because its normally added by cli.js
}
// ! non-CCA institutions will want to override the 2 variables below with
// ! a testing rc file that points to their own UUIDs
const testCollection = 'e1722640-f782-4a53-b20d-cda384f1aa22' // Test Collection
const testAdvancedSearch = '9f4a3509-8c49-6db9-de96-bb168bf80752' // Libraries advanced search
// options template which each test will modify to its needs
import rc from 'rc'
const opts = rc('equella', defaults)

// tests a few standard things we expect from every search API response
function testSuccessfulSearch(done, data) {
    assert.ok(typeof data.available === 'number', 'response data.available is a number')
    assert.ok(Array.isArray(data.results), 'response data.results is an array')
    done()
}

describe("search2 endpoint", () => {
    it('basic query search works', (done) => {
        let o = { ...opts }
        o.query = 'test'
        s2(o, (d) => testSuccessfulSearch(done, d))
    })

    it('single mimeTypes parameter works', (done) => {
        let o = { ...opts }
        o.mimeTypes = 'image/jpeg'
        s2(o, (d) => testSuccessfulSearch(done, d))
    })

    it('multiple mimeTypes parameters work', (done) => {
        let o = { ...opts }
        // multiple mime types
        o.mimeTypes = 'image/jpeg,image/png'
        s2(o, (d) => testSuccessfulSearch(done, d))
    })

    it('single musts parameter works', (done) => {
        let o = { ...opts }
        o.musts = 'realthumb:false'
        s2(o, (d) => testSuccessfulSearch(done, d))
    })

    it('multiple musts parameters work', (done) => {
        let o = { ...opts }
        // multiple musts
        o.musts = 'realthumb:true,videothumb:true'
        s2(o, (d) => testSuccessfulSearch(done, d))
    })

    // ! even with huge timeout this test still fails
    it('CSV export works', (done) => {
        let o = { ...opts }
        o.export = true
        o.collections = testCollection // must be limited to single collection
        s2(o, function (data) {
            assert.ok(data.length > 0, 'response data is not empty')
            assert.ok(data.toString().match(','), 'data has a comma in it')
            done()
        })
    }).timeout(5000)

    it('advancedSearch parameter works', (done) => {
        let o = { ...opts }
        o.advancedSearch = testAdvancedSearch
        s2(o, (d) => testSuccessfulSearch(done, d))
    })

    it('advancedSearch value must be a UUID', (done) => {
        let o = { ...opts }
        o.advancedSearch = 'NOT A UUID'
        console.error('We expect an error message below:')
        s2(o, function (data) {
            assert.ok(data.error, 'response data has error property')
            assert.ok(data.error_description, 'response data has error_description property')
            done()
        })
    })
})
