import assert from 'node:assert'
import { default as nr } from '../lib/normalize-root.js'

describe("normalize root", () => {
    it('Returns a string', (done) => {
        assert.strictEqual(typeof nr('example.com/api/'), 'string')
        assert.strictEqual(typeof nr('example.com/api'), 'string')
        assert.strictEqual(typeof nr('example.com'), 'string')
        done()
    })

    it('Removes /api if present', (done) => {
        assert.strictEqual('example.com/', nr('example.com/api/'))
        assert.strictEqual('example.com/', nr('example.com/api'))
        done()
    })

    it('Adds trailing slash to domain if missing', (done) => {
        assert.strictEqual('example.com/', nr('example.com'))
        done()
    })
})
