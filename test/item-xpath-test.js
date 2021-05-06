/*jshint esversion: 8 */
// @NOTE: this test requires a test collection with a UUID referenced inside
// test/fixtures/test-item.js
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const xpath = require('xpath')
const Dom = require('xmldom').DOMParser
const testData = require('./fixtures/test-item.json')
const err = (e) => { if (e) console.error(e) }

const doc = new Dom().parseFromString(testData.metadata)
let itemID;

async function createTestItem(cb) {
    const { stdout, stderr } = await exec('eq item --method post --file test/fixtures/test-item.json')
    err(stderr)
    // eq returns the item's API URL upon successful creation, it looks like
    // {config.root}/api/item/{uuid}/{version}/
    itemID = stdout.split('api/item/')[1]
    console.log(`Created test item ${stdout}`)
    cb()
}

async function testXpath(test) {
    const xp = '/xml/mods/titleInfo/title'
    const { stdout, stderr } = await exec(`eq item --xp ${xp} ${itemID}`)
    err(stderr)
    // returned XML data should be present in fixture metadata
    test.equals(stdout, xpath.select(xp, doc).toString() + '\n')
    test.done()
}

async function testXpathText(test) {
    const xp = '/xml/mods/titleInfo/subTitle'
    const { stdout, stderr } = await exec(`eq item --text --xp ${xp} ${itemID}`)
    err(stderr)
    // only text (no XML tags)
    test.equals(stdout, xpath.select(`${xp}/text()`, doc).toString() + '\n')
    test.done()
}

async function deleteTestItem(cb) {
    const { stdout, stderr } = await exec(`eq item --method delete ${itemID}`)
    err(stderr)
    console.log(`Deleted test item ${itemID}`)
    cb()
}

module.exports = {
    setUp: createTestItem,
    group: {
        "retrieve XML element from XPath": testXpath,
        "retrieve text of element from XPath": testXpathText
    },
    tearDown: deleteTestItem
}
