import assert from 'node:assert'
import { toISO8601 } from '../lib/iso8601.js'

describe('ISO 8601 dates', () => {
    it('Works with dates that are already ISO 8601', (done)=> {
        assert.equal(toISO8601('2021-07-01'), '2021-07-01')
        done()
    })
    it('Converts regular dates to ISO 8601', (done) => {
        assert.equal(toISO8601('July 1, 2021'), '2021-07-01')
        assert.equal(toISO8601('Dec, 2023'), '2023-12-01')
        assert.equal(toISO8601(2024), '2024-01-01')
        done()
    })
    it('Throws an error on an invalid date format', (done) => {
        console.log('We expect an error message below:')
        assert.throws(() => toISO8601('bobs bobob'))
        done()
    })
})
