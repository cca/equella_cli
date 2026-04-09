import assert from 'node:assert'
import { exec } from 'node:child_process'
import { readFileSync } from 'node:fs'
import rc from 'rc'
import taxonomy from '../endpoints/taxonomy.js'
import { isE2E, useMockMode, useE2EMode, mockResponse, cleanup } from './test-utils.js'

const testTaxo = JSON.parse(readFileSync('./test/fixtures/taxonomy.json'))
const testTerm1 = JSON.parse(readFileSync('./test/fixtures/test-term1.json'))
const testTerm2 = JSON.parse(readFileSync('./test/fixtures/test-term2.json'))

const err = (e, stderr) => {
    if (e) { console.error(e) }
    if (stderr) { console.error(stderr) }
}

// Default test config for mocked mode
const baseConfig = {
    method: 'get',
    endpoint: '/api/taxonomy/',
}
const testConfig = rc('equella', baseConfig)

// For mocked mode, override with test-specific config
if (!isE2E) {
    testConfig.token = 'test-token'
    testConfig.root = 'http://localhost:8080'
}

// global test taxonomy UUID shared by tests
let taxoID

function setup(done) {
    if (isE2E) {
        // E2E mode: use exec to create real objects
        exec('eq taxo --method post --file test/fixtures/taxonomy.json', (e, stdout, stderr) => {
            err(e, stderr)
            taxoID = stdout.split('api/taxonomy/')[1].trim()
            console.log(`Created test taxonomy ${stdout.trim()}`)

            // create first term
            exec(`eq taxo ${taxoID}/term --method post --file test/fixtures/test-term1.json`, (e, stdout, stderr) => {
                err(e, stderr)
                testTerm1.uuid = stdout.split('/term')[1].trim()
                // create 2nd term
                return exec(`eq taxo ${taxoID}/term --method post --file test/fixtures/test-term2.json`, (e, stdout, stderr) => {
                    err(e, stderr)
                    testTerm2.uuid = stdout.split('/term')[1].trim()
                    return done()
                })
            })
        })
    } else {
        // Mocked mode: no setup needed, just use fixed UUID
        taxoID = 'test-taxo-uuid-12345'
        done()
    }
}

function testFindByName(done) {
    if (isE2E) {
        exec(`eq taxo --name "${testTaxo.name}"`, (e, stdout, stderr) => {
            err(e, stderr)
            const results = JSON.parse(stdout)
            assert.equal(results.name, testTaxo.name)
            assert.equal(results.dataSource, testTaxo.dataSource)
            assert.equal(results.readonly, testTaxo.readonly)
            assert.ok(results.uuid)
            done()
        })
    } else {
        // Register both mocks for find-by-name workflow
        mockResponse('/api/taxonomy/?length=5000', 'get', 'taxonomy-search-response.json')
        mockResponse('/api/taxonomy/test-taxo-uuid-12345', 'get', 'taxonomy-response.json')
        const opts = { ...testConfig, path: taxoID }
        taxonomy(opts, (results) => {
            assert.equal(results.name, testTaxo.name)
            assert.equal(results.dataSource, testTaxo.dataSource)
            assert.equal(results.readonly, testTaxo.readonly)
            assert.ok(results.uuid)
            done()
        })
    }
}

function testFindByUUID(done) {
    if (isE2E) {
        exec(`eq taxo ${taxoID}`, (e, stdout, stderr) => {
            err(e, stderr)
            const results = JSON.parse(stdout)
            assert.equal(results.name, testTaxo.name)
            assert.equal(results.dataSource, testTaxo.dataSource)
            assert.equal(results.readonly, testTaxo.readonly)
            assert.ok(results.uuid)
            done()
        })
    } else {
        mockResponse('/api/taxonomy/test-taxo-uuid-12345', 'get', 'taxonomy-response.json')
        const opts = { ...testConfig, path: taxoID }
        taxonomy(opts, (results) => {
            assert.equal(results.name, testTaxo.name)
            assert.equal(results.dataSource, testTaxo.dataSource)
            assert.equal(results.readonly, testTaxo.readonly)
            assert.ok(results.uuid)
            done()
        })
    }
}

function testGetTerms(done) {
    if (isE2E) {
        exec(`eq taxo ${taxoID} --terms`, (e, stdout, stderr) => {
            err(e, stderr)
            const results = JSON.parse(stdout)
            assert.equal(results.length, 2)
            assert.equal(results[1].term, testTerm1.term)
            assert.equal(results[0].term, testTerm2.term)
            done()
        })
    } else {
        mockResponse('/api/taxonomy/test-taxo-uuid-12345/term', 'get', 'taxonomy-terms-response.json')
        const opts = { ...testConfig, path: taxoID + '/term' }
        taxonomy(opts, (results) => {
            assert.equal(results.length, 2)
            assert.equal(results[1].term, testTerm1.term)
            assert.equal(results[0].term, testTerm2.term)
            done()
        })
    }
}

function testSearch(done) {
    if (isE2E) {
        exec(`eq taxo ${taxoID} --search "${testTerm1.term}"`, (e, stdout, stderr) => {
            err(e, stderr)
            const results = JSON.parse(stdout).results
            assert.equal(results.length, 1)
            assert.equal(results[0].term, testTerm1.term)
            done()
        })
    } else {
        mockResponse('/api/taxonomy/test-taxo-uuid-12345/search', 'get', 'taxonomy-term-search-response.json')
        const opts = { ...testConfig, path: taxoID, search: testTerm1.term }
        taxonomy(opts, (results) => {
            const searchResults = results.results
            assert.equal(searchResults.length, 1)
            assert.equal(searchResults[0].term, testTerm1.term)
            done()
        })
    }
}

// ensure --search works with direct path lookup
function testSearchWithName(done) {
    if (isE2E) {
        exec(`eq taxo ${taxoID} --search "${testTerm2.term}"`, (e, stdout, stderr) => {
            err(e, stderr)
            const results = JSON.parse(stdout).results
            assert.equal(results.length, 1)
            assert.equal(results[0].term, testTerm2.term)
            done()
        })
    } else {
        mockResponse('/api/taxonomy/test-taxo-uuid-12345/search', 'get', {
            results: [{
                uuid: 'test-term-2-uuid',
                term: testTerm2.term
            }],
            available: 1
        })
        const opts = { ...testConfig, path: taxoID, search: testTerm2.term }
        taxonomy(opts, (results) => {
            const searchResults = results.results
            assert.equal(searchResults.length, 1)
            assert.equal(searchResults[0].term, testTerm2.term)
            done()
        })
    }
}

function teardown(done) {
    if (isE2E) {
        // delete test taxo
        exec(`eq taxo --method delete ${taxoID}`, (e, stdout, stderr) => {
            err(e, stderr)
            console.log(`Deleted test taxonomy ${taxoID}`)
            done()
        })
    } else {
        // Mocked mode: just clean up
        cleanup()
        done()
    }
}

describe("taxonomy endpoint", function() {
    if (isE2E) {
        before(useE2EMode)
        this.timeout(5000) // easy for E2E tests to take >2s
    } else {
        before(useMockMode)
    }

    before(setup)
    after(teardown)
    it("find a taxonomy by its name using --name", testFindByName)
    it("find a taxonomy by its UUID", testFindByUUID)
    it("get the terms in a taxonomy with --terms", testGetTerms)
    it("search a taxonomy for terms", testSearch)
    it("search a taxonomy for terms using --name", testSearchWithName)
})
