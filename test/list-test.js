const list = require('../lib/list')

exports['Handle single-item lists'] = (test) => {
    test.strictEqual(list(['one']), 'one')
    test.strictEqual(list([1]), '1')
    test.done()
}

exports['Handle two-item lists'] = (test) => {
    test.strictEqual(list(['one', 'two']), 'one and two')
    test.done()
}

exports['Handle lists with more than two items'] = (test) => {
    test.strictEqual(list([1,2,3]), '1, 2, and 3')
    test.done()
}

exports['Work with a custom coordinating conjunction'] = (test) => {
    test.strictEqual(list([1,2,3], 'or'), '1, 2, or 3')
    test.strictEqual(list(['cow','monkey','dog'], 'and/or'), 'cow, monkey, and/or dog')
    test.done()
}

exports['Work with a custom separator'] = (test) => {
    test.strictEqual(list(['long list item one', 'another pretty long list item like this one', 'but do not look just yet here is another long item!', 'one final long item just for good measure'], 'and', '; '), 'long list item one; another pretty long list item like this one; but do not look just yet here is another long item!; and one final long item just for good measure')
    test.done()
}

exports['Sort the provided array before listing'] = (test) => {
    test.strictEqual(list(['cow', 'monkey', 'dog'], 'and', ', ', sort=true), 'cow, dog, and monkey')
    test.strictEqual(list(['one', 'two', 'four'], 'or', ', ', sort=true), 'four, one, or two')
    test.done()
}
