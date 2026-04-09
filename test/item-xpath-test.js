// ! this test requires a test collection with a UUID referenced inside test/fixtures/test-item.json
import assert from 'node:assert'
import { exec } from 'node:child_process'
import { select } from 'xpath'
import { DOMParser } from '@xmldom/xmldom'
import { readFileSync } from 'node:fs'
import rc from 'rc'
import item from '../endpoints/item.js'
import { isE2E, useMockMode, useE2EMode, mockResponse, resetMocks, cleanup } from './test-utils.js'

const testData = JSON.parse(readFileSync('./test/fixtures/test-item.json'))
const err = (e) => {
    if (e) console.error(e)
}

const doc = new DOMParser().parseFromString(testData.metadata, 'text/xml')

const baseConfig = {
    method: 'get',
    endpoint: '/api/item/',
}
const testConfig = rc('equella', baseConfig)

// For mocked mode, override with test-specific config
if (!isE2E) {
    testConfig.token = 'test-token'
    testConfig.root = 'https://localhost'
}

let itemID

function createTestItem(done) {
    if (isE2E) {
        exec('eq item --method post --file test/fixtures/test-item.json', (e, stdout, stderr) => {
            err(e)
            err(stderr)
            // eq returns the item's API URL upon successful creation, it looks like
            // {config.root}/api/item/{uuid}/{version}/
            itemID = stdout.split('api/item/')[1]
            console.log(`Created test item ${stdout.trim()}`)
            done()
        })
    } else {
        itemID = 'test-item-uuid-12345/1/'
        done()
    }
}

function testXpath(done) {
    const xp = '/xml/mods/titleInfo/title'
    const element = select(xp, doc).toString()
    if (isE2E) {
        exec(`eq item --xp ${xp} ${itemID}`, (e, stdout, stderr) => {
            err(stderr)
            // returned XML data should be present in fixture metadata
            assert.equal(stdout, element + '\n')
            done()
        })
    } else {
        mockResponse(`/api/item/${itemID}`, 'get', testData)
        const opts = { ...testConfig, path: itemID, xp: xp }
        item(opts, (result) => {
            assert.equal(result, element)
            done()
        })
    }
}

function testXpathText(done) {
    const xp = '/xml/mods/titleInfo/subTitle'
    const text = select(`${xp}/text()`, doc).toString()
    assert.ok(text, 'Test fixture should contain text at the specified XPath')
    if (isE2E) {
        exec(`eq item --text --xp ${xp} ${itemID}`, (e, stdout, stderr) => {
            err(stderr)
            // only text (no XML tags)
            assert.equal(stdout, text + '\n')
            done()
        })
    } else {
        mockResponse(`/api/item/${itemID}`, 'get', testData)
        const opts = { ...testConfig, path: itemID, xp: xp, text: true }
        item(opts, (result) => {
            assert.equal(result, text)
            done()
        })
    }
}

function deleteTestItem(done) {
    if (isE2E) {
        exec(`eq item --method delete ${itemID}`, (e, stdout, stderr) => {
            err(stderr)
            console.log(`Deleted test item ${itemID}`)
            done()
        })
    } else {
        // Non-E2E uses cleanup() to reset global state
        cleanup()
        done()
    }
}

describe("item xpaths", () => {
    if (isE2E) {
        before(useE2EMode)
    } else {
        before(useMockMode)
    }

    before(createTestItem)
    after(deleteTestItem)
    it("retrieve XML element from XPath", testXpath).timeout(5000)
    it("retrieve text of element from XPath", testXpathText).timeout(5000)
})
