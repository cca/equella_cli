import {checkUUID} from '../lib/checkUUID.js'

exports['Checks if a string is a UUID'] = function (test) {
    test.ok(checkUUID('9f4a3509-8c49-6db9-de96-bb168bf80752'))
    test.ok(!checkUUID('9f4a3509-8c49-6db9-de96-bb168bf8'))
    test.ok(!checkUUID('Collection Name'))
    test.done()
}
