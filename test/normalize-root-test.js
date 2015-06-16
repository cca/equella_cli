var nr = require('../lib/normalize-root')

exports['Returns a string'] = function (test) {
    test.strictEqual(typeof nr('example.com/api/'), 'string')
    test.strictEqual(typeof nr('example.com/api'), 'string')
    test.strictEqual(typeof nr('example.com'), 'string')
    test.done()
}

exports['Removes /api/? if present'] = function (test) {
    test.strictEqual('example.com/', nr('example.com/api/'))
    test.strictEqual('example.com/', nr('example.com/api'))
    test.done()
}

exports['Adds trailing slash to domain if missing'] = function (test) {
    test.strictEqual('example.com/', nr('example.com'))
    test.done()
}
