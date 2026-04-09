import assert from 'node:assert'
import { default as s2 } from '../endpoints/search2.js'
import { isE2E, useMockMode, useE2EMode, mockResponse, cleanup } from './test-utils.js'
import rc from 'rc'

const defaults = {
    // short length & no attachments to speed up response times
    length: 1,
    includeAttachment: false,
    method: 'get',
    endpoint: '/api/search2/',
}

const opts = rc('equella', defaults)

// For mocked mode, override with test-specific config
if (!isE2E) {
    opts.token = 'test-token'
    opts.root = 'https://localhost'
}

// non-CCA institutions will want to override the 2 variables below with
// a testing rc file that points to their own UUIDs
const testCollection = 'e1722640-f782-4a53-b20d-cda384f1aa22' // Test Collection
const testAdvancedSearch = '9f4a3509-8c49-6db9-de96-bb168bf80752' // Libraries advanced search

// tests a few standard things we expect from every search API response
function testSuccessfulSearch(done, data) {
    assert.ok(typeof data.available === 'number', 'response data.available is a number')
    assert.ok(Array.isArray(data.results), 'response data.results is an array')
    done()
}

describe("search2 endpoint", function () {
    this.timeout(5000) // search queries are often slow

    if (isE2E) {
        before(useE2EMode)
    } else {
        before(() => {
            useMockMode()
            // Register the mock right before tests run, not during collection
            mockResponse("/api/search2/", "get", "search2-response.json")
        })
    }

    after(cleanup)

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

    it('CSV export works', (done) => {
        let o = { ...opts }
        o.export = true
        o.collections = testCollection // must be limited to single collection
        if (!isE2E) {
            mockResponse('/api/search2/export', 'get', 'col1,col2\nval1,val2\n', 200, { 'content-type': 'text/csv' })
        }
        s2(o, function (data) {
            assert.ok(data.length > 0, 'response data is not empty')
            assert.ok(data.toString().match(','), 'data has a comma in it')
            done()
        })
    })

    it('advancedSearch parameter works', (done) => {
        let o = { ...opts }
        o.advancedSearch = testAdvancedSearch
        s2(o, (d) => testSuccessfulSearch(done, d))
    })

    it('advancedSearch value must be a UUID', (done) => {
        let o = { ...opts }
        o.advancedSearch = 'NOT A UUID'
        if (isE2E) {
            console.error("We expect an error message below:")
        } else {
            // Create a specific mock so it doesn't interfere with later tests
            mockResponse(
                "/api/search2/?query=&length=1&info=basic&advancedSearch=NOT%2520A%2520UUID",
                "get",
                {
                    error: "Invalid UUID",
                    error_description:
                    "The advancedSearch value must be a valid UUID",
                },
                400,
            )
        }
        s2(o, function (data) {
            assert.ok(data.error, 'response data has error property')
            assert.ok(data.error_description, 'response data has error_description property')
            done()
        })
    })

    it('info parameter accepts comma-separated valid values', (done) => {
        let o = { ...opts }
        o.info = 'basic,metadata'
        s2(o, (d) => testSuccessfulSearch(done, d))
    })

    it('status parameter accepts comma-separated valid values', (done) => {
        let o = { ...opts }
        o.status = 'live,draft'
        s2(o, (d) => testSuccessfulSearch(done, d))
    })

    it('order parameter must be valid', (done) => {
        let o = { ...opts }
        o.order = 'invalidorder'
        s2(o, function (data) {
            assert.ok(data.error, 'response has error property')
            assert.ok(data.error_description.includes('Unrecognized "order" value'), 'error message mentions order')
            assert.ok(data.error_description.includes('invalidorder'), 'error message shows the invalid value')
            done()
        })
    })

    it('info parameter must be valid', (done) => {
        let o = { ...opts }
        o.info = 'invalidinfo'
        s2(o, function (data) {
            assert.ok(data.error, 'response has error property')
            assert.ok(data.error_description.includes('Unrecognized "info" value'), 'error message mentions info')
            done()
        })
    })

    it('info parameter rejects mixed valid and invalid values', (done) => {
        let o = { ...opts }
        o.info = 'basic,invalidinfo'
        s2(o, function (data) {
            assert.ok(data.error, 'response has error property')
            assert.ok(data.error_description.includes('Unrecognized "info" value'), 'error message mentions info')
            assert.ok(data.error_description.includes('basic,invalidinfo'), 'error shows the full value passed')
            done()
        })
    })

    it('status parameter must be valid', (done) => {
        let o = { ...opts }
        o.status = 'invalidstatus'
        s2(o, function (data) {
            assert.ok(data.error, 'response has error property')
            assert.ok(data.error_description.includes('Unrecognized "status" value'), 'error message mentions status')
            done()
        })
    })

    it('status parameter rejects mixed valid and invalid values', (done) => {
        let o = { ...opts }
        o.status = 'live,invalidstatus'
        s2(o, function (data) {
            assert.ok(data.error, 'response has error property')
            assert.ok(data.error_description.includes('Unrecognized "status" value'), 'error message mentions status')
            done()
        })
    })
})
