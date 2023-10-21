import assert from 'node:assert'
import { list } from '../lib/list.js'

describe('lists', () => {
    it('Handle single-item lists', (done) => {
        assert.strictEqual(list(['one']), 'one')
        assert.strictEqual(list([1]), '1')
        done()
    })

    it('Handle two-item lists', (done) => {
        assert.strictEqual(list(['one', 'two']), 'one and two')
        done()
    })

    it('Handle lists with more than two items', (done) => {
        assert.strictEqual(list([1, 2, 3]), '1, 2, and 3')
        done()
    })

    it('Work with a custom coordinating conjunction', (done) => {
        assert.strictEqual(list([1, 2, 3], 'or'), '1, 2, or 3')
        assert.strictEqual(list(['cow', 'monkey', 'dog'], 'and/or'), 'cow, monkey, and/or dog')
        done()
    })

    it('Work with a custom separator', (done) => {
        assert.strictEqual(list(['long list item one', 'another pretty long list item like this one', 'but do not look just yet here is another long item!', 'one final long item just for good measure'], 'and', '; '), 'long list item one; another pretty long list item like this one; but do not look just yet here is another long item!; and one final long item just for good measure')
        done()
    })

    it('Sort the provided array before listing', (done) => {
        assert.strictEqual(list(['cow', 'monkey', 'dog'], 'and', ', ', true), 'cow, dog, and monkey')
        assert.strictEqual(list(['one', 'two', 'four'], 'or', ', ', true), 'four, one, or two')
        done()
    })
})
