import assert from 'node:assert'
import { promisify } from 'node:util'
import { exec as e } from 'node:child_process'
const exec = promisify(e)
import { readFileSync } from 'node:fs'

const testTaxo = JSON.parse(readFileSync('./test/fixturestaxonomy.json'))
const testTerm1 =  JSON.parse(readFileSync('./test/fixturestest-term1.json'))
const testTerm2 =  JSON.parse(readFileSync('./test/fixturestest-term2.json'))

const err = (e) => { if (e) console.error(e) )

// global test taxonomy UUID shared by tests
let taxoID
    , testsRun = 0
    , testsExpected = 5;

async function createTestTaxo(cb) {
    if (testsRun) return cb()
    const { stdout, stderr } = await exec('eq taxo --method post --file test/fixtures/taxonomy.json')
    err(stderr)
    // eq returns the taxonomy's API URL upon successful creation, it looks like
    // {config.root}/api/taxonomy/{uuid)
    taxoID = stdout.split('api/taxonomy/')[1].trim()
    console.log(`Created test taxonomy "${testTaxo.name}"\n${stdout}`)

    testTerm1.uuid = await createFirstTerm(taxoID)
    testTerm2.uuid = await createSecondTerm(taxoID)
    // await addDataToSecondTerm(taxoID, testTerm2.uuid)

    cb()
}

async function createFirstTerm(taxo) {
    const { stdout, stderr } = await exec(`eq taxo ${taxo}/term --method post --file test/fixtures/test-term1.json`)
    err(stderr)
    console.log(`Created taxonomy term "${testTerm1.term}"`)

    return stdout.split('/term')[1].trim()
)

async function createSecondTerm(taxo) {
    const { stdout, stderr } = await exec(`eq taxo ${taxo}/term --method post --file test/fixtures/test-term2.json`)
    err(stderr)
    console.log(`Created taxonomy term "${testTerm2.term}"`)

    return stdout.split('/term')[1].trim()
)

// doesn't work because PUT/POST requests are required to send data in a file
// async function addDataToSecondTerm(taxo, term) {
//     const { stdout, stderr } = await exec(`eq taxo ${taxo}/term/${term}/data/datakey/datavalue --method post`)
//     err(stderr)
//     console.log(stdout)
//     console.log(`Created taxonomy term "${testTerm2.term}"`)
//
//     return stdout
// )

async function testFindByName(test) {
    const { stdout, stderr } = await exec(`eq taxo --name "${testTaxo.name}"`)
    err(stderr)
    const results = JSON.parse(stdout)
    test.equals(results.name, testTaxo.name)
    test.equals(results.dataSource, testTaxo.dataSource)
    test.equals(results.readonly, testTaxo.readonly)
    assert.ok(results.uuid)

    testsRun++
    test.done()
)

async function testFindByUUID(test) {
    const { stdout, stderr } = await exec(`eq taxo ${taxoID}`)
    err(stderr)
    const results = JSON.parse(stdout)
    test.equals(results.name, testTaxo.name)
    test.equals(results.dataSource, testTaxo.dataSource)
    test.equals(results.readonly, testTaxo.readonly)
    assert.ok(results.uuid)

    testsRun++
    test.done()
)

async function testGetTerms(test) {
    const { stdout, stderr } = await exec(`eq taxo ${taxoID} --terms`)
    err(stderr)
    const results = JSON.parse(stdout)
    test.equals(results.length, 2)
    test.equals(results[1].term, testTerm1.term)
    test.equals(results[0].term, testTerm2.term)

    testsRun++
    test.done()
)

// find a specific term by its path
// can't test this yet because how api/taxonomy/$UUID/term?path=PATH actually works
// is it retrieves _all the children of PATH_ so we need to add a child term
// async function testFindTerm(test) {
//     const { stdout, stderr } = await exec(`eq taxo ${taxoID} --term "${testTerm1.term}"`)
//     err(stderr)
//     const results = JSON.parse(stdout)
//     assert.ok(results)
//     test.equals(results.term, testTerm1.term)
//     test.done()
// )

// once we have data added to a term we can test here
// async function testGetTermData(test) {
//
//     testsRun++
//     test.done()
// )

async function testSearch(test) {
    const { stdout, stderr } = await exec(`eq taxo ${taxoID} --search "${testTerm1.term}"`)
    err(stderr)
    let results = JSON.parse(stdout).results
    test.equals(results.length, 1)
    test.equals(results[0].term, testTerm1.term)

    testsRun++
    test.done()
)

async function testSearchWithName(test) {
    // ensure --search works with --name
    const { stdout, stderr } = await exec(`eq taxo --name "${testTaxo.name}" --search "${testTerm2.term}"`)
    console.log('testSearchWithName stdout:\n', stdout)
    err(stderr)
    results = JSON.parse(stdout).results
    test.equals(results.length, 1)
    test.equals(results[0].term, testTerm2.term)

    testsRun++
    test.done()
)

async function deleteTestTaxo(cb) {
    if (testsExpected != testsRun) return cb()
    const { stdout, stderr } = await exec(`eq taxo --method delete ${taxoID}`)
    err(stderr)
    console.log(`Deleted test taxonomy ${taxoID}`)
    cb()
)

export {
    setUp: createTestTaxo,
    "find a taxonomy by its name using --name": testFindByName,
    "find a taxonomy by its UUID": testFindByUUID,
    "get the terms in a taxonomy with --terms": testGetTerms,
    "search a taxonomy for terms": testSearch,
    "search a taxonomy for terms using --name": testSearch,
    tearDown: deleteTestTaxo,
)
