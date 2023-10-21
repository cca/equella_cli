import assert from 'node:assert'
import { checkUUID } from '../lib/checkUUID.js'

describe('UUID', () => {
    it('Checks if a string is a UUID', (done)=> {
        assert.ok(checkUUID('9f4a3509-8c49-6db9-de96-bb168bf80752'))
        assert.ok(!checkUUID('9f4a3509-8c49-6db9-de96-bb168bf8'))
        assert.ok(!checkUUID('Collection Name'))
        done()
    })
})
