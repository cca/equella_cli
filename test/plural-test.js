import assert from 'node:assert'
import { plural as pl } from '../lib/plural.js'

describe('pluralize words', () => {
    it('Pluralize words ending with a Y', (done) => {
        assert.strictEqual('taxonomies', pl('taxonomy'))
        assert.strictEqual('taxonomies', pl('taxonomy/'))
        done()
    })

    it('Pluralize words ending with a non-Y, non-S letter', (done) => {
        assert.strictEqual('roles', pl('role'))
        assert.strictEqual('roles', pl('role/'))
        done()
    })

    it('Do not double pluralize a plural', (done) => {
        assert.strictEqual('groups', pl('groups'))
        assert.strictEqual('groups', pl('groups/'))
        done()
    })
})
