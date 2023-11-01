// ! this test requires a test collection with a UUID referenced inside test/fixtures/test-item.json
import assert from 'node:assert'
import { exec } from 'node:child_process'
import { select } from 'xpath'
import { DOMParser } from '@xmldom/xmldom'
import { readFileSync } from 'node:fs'
const testData =  JSON.parse(readFileSync('./test/fixtures/test-item.json'))
const err = (e) => {
    if (e) console.error(e)
}

const doc = new DOMParser().parseFromString(testData.metadata)
let itemID;

function createTestItem(cb) {
    exec('eq item --method post --file test/fixtures/test-item.json', (e, stdout, stderr) => {
        err(e)
        err(stderr)
        // eq returns the item's API URL upon successful creation, it looks like
        // {config.root}/api/item/{uuid}/{version}/
        itemID = stdout.split('api/item/')[1]
        console.log(`Created test item ${stdout.trim()}`)
        cb()
    })
}

function testXpath(done) {
    const xp = '/xml/mods/titleInfo/title'
    exec(`eq item --xp ${xp} ${itemID}`, (e, stdout, stderr) => {
        err(stderr)
        // returned XML data should be present in fixture metadata
        assert.equal(stdout, select(xp, doc).toString() + '\n')
        done()
    })
}

function testXpathText(done) {
    const xp = '/xml/mods/titleInfo/subTitle'
    exec(`eq item --text --xp ${xp} ${itemID}`, (e, stdout, stderr) => {
        err(stderr)
        // only text (no XML tags)
        assert.equal(stdout, select(`${xp}/text()`, doc).toString() + '\n')
        done()
    })
}

function deleteTestItem(cb) {
    exec(`eq item --method delete ${itemID}`, (e, stdout, stderr) => {
        err(stderr)
        console.log(`Deleted test item ${itemID}`)
        cb()
    })
}

describe("item xpaths", () => {
    before(createTestItem)
    after(deleteTestItem)
    it("retrieve XML element from XPath", testXpath).timeout(5000)
    it("retrieve text of element from XPath", testXpathText).timeout(5000)
})
