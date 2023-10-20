import assert from 'node:assert'
import { plural as pl } from '../lib/plural.js'

exports['Pluralize words ending with a Y'] = function (test) {
    test.strictEqual('taxonomies', pl('taxonomy'))
    test.strictEqual('taxonomies', pl('taxonomy/'))
    test.done()
}

exports['Pluralize words ending with a non-Y, non-S letter'] = function (test) {
    test.strictEqual('roles', pl('role'))
    test.strictEqual('roles', pl('role/'))
    test.done()
}

exports['Do not double pluralize a plural'] = function (test) {
    test.strictEqual('groups', pl('groups'))
    test.strictEqual('groups', pl('groups/'))
    test.done()
}
