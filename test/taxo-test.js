/*jshint esversion: 8 */
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const testTaxo = require('./fixtures/taxonomy.json')
const testTerm1 = require('./fixtures/test-term1.json')
const testTerm2 = require('./fixtures/test-term2.json')
const err = (e) => { if (e) console.error(e) }

// global test taxonomy UUID shared by tests
let taxoID
    , testsRun = 0
    , testsExpected = 3;

async function createTestTaxo(cb) {
    if (testsRun) return cb()
    const { stdout, stderr } = await exec('eq taxo --method post --file test/fixtures/taxonomy.json')
    err(stderr)
    // eq returns the taxonomy's API URL upon successful creation, it looks like
    // {config.root}/api/taxonomy/{uuid}
    taxoID = stdout.split('api/taxonomy/')[1].trim()
    console.log(`Created test taxonomy "${testTaxo.name}"\n${stdout}`)

    // add a couple terms to our taxonomy BUG these seem to not work
    const { stdout1, stderr1 } = await exec(`eq taxo ${taxoID}/term --method post --file test/fixtures/test-term1.json`)
    err(stderr1)
    // stdout is just undefined
    console.log(`Created taxonomy term "${testTerm1.term}"`)

    const { stdout2, stderr2 } = await exec(`eq taxo ${taxoID}/term --method post --file test/fixtures/test-term2.json`)
    err(stderr2)
    console.log(`Created taxonomy term "${testTerm2.term}"`)
    cb()
}

async function testFindByName(test) {
    const { stdout, stderr } = await exec(`eq taxo --name "${testTaxo.name}"`)
    err(stderr)
    const results = JSON.parse(stdout)
    test.equals(results.name, testTaxo.name)
    test.equals(results.dataSource, testTaxo.dataSource)
    test.equals(results.readonly, testTaxo.readonly)
    test.ok(results.uuid)
    testsRun++
    test.done()
}

async function testFindByUUID(test) {
    const { stdout, stderr } = await exec(`eq taxo ${taxoID}`)
    err(stderr)
    const results = JSON.parse(stdout)
    test.equals(results.name, testTaxo.name)
    test.equals(results.dataSource, testTaxo.dataSource)
    test.equals(results.readonly, testTaxo.readonly)
    test.ok(results.uuid)
    testsRun++
    test.done()
}

async function testGetTerms(test) {
    const { stdout, stderr } = await exec(`eq taxo ${taxoID} --terms`)
    err(stderr)
    const results = JSON.parse(stdout)
    test.equals(results.length, 2)
    test.equals(results[1].term, testTerm1.term)
    test.equals(results[0].term, testTerm2.term)
    testsRun++
    test.done()
}

// find a specific term by its path
// can't test this yet because how api/taxonomy/$UUID/term?path=PATH actually works
// is it retrieves _all the children of PATH_ so we need to add a child term
// async function testFindTerm(test) {
//     const { stdout, stderr } = await exec(`eq taxo ${taxoID} --term "${testTerm1.term}"`)
//     err(stderr)
//     const results = JSON.parse(stdout)
//     test.ok(results)
//     test.equals(results.term, testTerm1.term)
//     test.done()
// }

async function deleteTestTaxo(cb) {
    if (testsExpected != testsRun) return cb()
    const { stdout, stderr } = await exec(`eq taxo --method delete ${taxoID}`)
    err(stderr)
    console.log(`Deleted test taxonomy ${taxoID}`)
    cb()
}

module.exports = {
    setUp: createTestTaxo,
    "find a taxonomy by its name using --name": testFindByName,
    "find a taxonomy by its UUID": testFindByUUID,
    "get the terms in a taxonomy with --terms": testGetTerms,
    tearDown: deleteTestTaxo
}
