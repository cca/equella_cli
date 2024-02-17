import assert from 'node:assert'
import { exec } from 'node:child_process'
import { readFileSync } from 'node:fs'

const testTaxo = JSON.parse(readFileSync('./test/fixtures/taxonomy.json'))
const testTerm1 =  JSON.parse(readFileSync('./test/fixtures/test-term1.json'))
const testTerm2 =  JSON.parse(readFileSync('./test/fixtures/test-term2.json'))

const err = (e, stderr) => {
    if (e) { console.error(e) }
    if (stderr) { console.error(stderr) }
}

// global test taxonomy UUID shared by tests
let taxoID

function createTestTaxo(cb) {
    exec('eq taxo --method post --file test/fixtures/taxonomy.json', (e, stdout, stderr) => {
        err(e, stderr)
        // eq returns the taxonomy's API URL upon successful creation, it looks like
        // {config.root}/api/taxonomy/{uuid)
        taxoID = stdout.split('api/taxonomy/')[1].trim()
        console.log(`Created test taxonomy ${stdout.trim()}`)

        // create first term
        exec(`eq taxo ${taxoID}/term --method post --file test/fixtures/test-term1.json`, (e, stdout, stderr) => {
            err(e, stderr)
            testTerm1.uuid = stdout.split('/term')[1].trim()
            // console.log(`Created taxonomy term "${testTerm1.term}"`)
            // create 2nd term
            return exec(`eq taxo ${taxoID}/term --method post --file test/fixtures/test-term2.json`, (e, stdout, stderr) => {
                err(e, stderr)
                testTerm2.uuid = stdout.split('/term')[1].trim()
                // console.log(`Created taxonomy term "${testTerm2.term}"`)
                return cb()
            })
        })
    })
}

function testFindByName(done) {
    exec(`eq taxo --name "${testTaxo.name}"`, (e, stdout, stderr) => {
        err(e, stderr)
        const results = JSON.parse(stdout)
        assert.equal(results.name, testTaxo.name)
        assert.equal(results.dataSource, testTaxo.dataSource)
        assert.equal(results.readonly, testTaxo.readonly)
        assert.ok(results.uuid)
        done()
    })
}

function testFindByUUID(done) {
    exec(`eq taxo ${taxoID}`, (e, stdout, stderr) => {
        err(e, stderr)
        const results = JSON.parse(stdout)
        assert.equal(results.name, testTaxo.name)
        assert.equal(results.dataSource, testTaxo.dataSource)
        assert.equal(results.readonly, testTaxo.readonly)
        assert.ok(results.uuid)
        done()
    })
}

function testGetTerms(done) {
    exec(`eq taxo ${taxoID} --terms`, (e, stdout, stderr) => {
        err(e, stderr)
        const results = JSON.parse(stdout)
        assert.equal(results.length, 2)
        assert.equal(results[1].term, testTerm1.term)
        assert.equal(results[0].term, testTerm2.term)
        done()
    })
}

// find a specific term by its path
// can't test this yet because how api/taxonomy/$UUID/term?path=PATH actually works
// is it retrieves _all the children of PATH_ so we need to add a child term
// function testFindTerm(done) {
//     exec(`eq taxo ${taxoID} --term "${testTerm1.term}"`)
//     err(stderr)
//     const results = JSON.parse(stdout)
//     assert.ok(results)
//     assert.equal(results.term, testTerm1.term)
//     done()
// )

// once we have data added to a term we can test here
// function testGetTermData(done) {}

function testSearch(done) {
    exec(`eq taxo ${taxoID} --search "${testTerm1.term}"`, (e, stdout, stderr) => {
        err(e, stderr)
        const results = JSON.parse(stdout).results
        assert.equal(results.length, 1)
        assert.equal(results[0].term, testTerm1.term)
        done()
    })
}

// ensure --search works with --name
function testSearchWithName(done) {
    exec(`eq taxo --name "${testTaxo.name}" --search "${testTerm2.term}"`, (e, stdout, stderr) => {
        err(e, stderr)
        const results = JSON.parse(stdout).results
        assert.equal(results.length, 1)
        assert.equal(results[0].term, testTerm2.term)
        done()
    })
}

function deleteTestTaxo(cb) {
    exec(`eq taxo --method delete ${taxoID}`, (e, stdout, stderr) => {
        err(e, stderr)
        console.log(`Deleted test taxonomy ${taxoID}`)
        cb()
    })
}

describe("taxonomy endpoint", function() {
    this.timeout(5000) // easy for these tests to take >2s
    before(createTestTaxo)
    after(deleteTestTaxo)
    it("find a taxonomy by its name using --name", testFindByName)
    it("find a taxonomy by its UUID", testFindByUUID)
    it("get the terms in a taxonomy with --terms", testGetTerms)
    it("search a taxonomy for terms", testSearch)
    it("search a taxonomy for terms using --name", testSearchWithName).timeout(5000)
})
