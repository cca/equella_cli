/*jshint esversion: 8 */
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const testData = require('./fixtures/taxonomy.json')

let itemID;

async function createTestTaxo(cb) {
    const { stdout, stderr } = await exec('eq taxo --method post --file test/fixtures/taxonomy.json')
    console.error(stderr)
    // eq returns the taxonomy's API URL upon successful creation, it looks like
    // {config.root}/api/taxonomy/{uuid}
    itemID = stdout.split('api/taxonomy/')[1]
    console.log(`Created test taxonomy ${stdout}\n"${testData.name}"`)
    cb()
}

async function testFindByName(test) {
    const { stdout, stderr } = await exec(`eq taxo --name "${testData.name}"`)
    console.error(stderr)
    const results = JSON.parse(stdout)
    test.equals(results.name, testData.name)
    test.equals(results.dataSource, testData.dataSource)
    test.equals(results.readonly, testData.readonly)
    test.ok(results.uuid)
    test.done()
}

async function testFindByUUID(test) {
    const { stdout, stderr } = await exec(`eq taxo ${itemID}`)
    console.error(stderr)
    const results = JSON.parse(stdout)
    test.equals(results.name, testData.name)
    test.equals(results.dataSource, testData.dataSource)
    test.equals(results.readonly, testData.readonly)
    test.ok(results.uuid)
    test.done()
}

async function deleteTestTaxo(cb) {
    const { stdout, stderr } = await exec(`eq taxo --method delete ${itemID}`)
    console.error(stderr)
    console.log(`Deleted test taxonomy ${itemID}`)
    cb()
}

module.exports = {
    setUp: createTestTaxo,
    group: {
        "test finding a taxonomy by --name": testFindByName
    },
    tearDown: deleteTestTaxo
}
