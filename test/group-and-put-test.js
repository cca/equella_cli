// test both group API endpoint and using HTTP PUT to modify a group
// ! this test requires a test group with a UUID referenced inside
// ! test/fixtures/original-group.json & test/fixtures/new-group.json
import assert from 'node:assert'
import { exec } from 'node:child_process'
import { readFileSync } from 'node:fs'
const group = JSON.parse(readFileSync('./fixtures/original-group.json'))

const handleErr = (e) => { if (e) console.error(e) }

exports["test `eq group $UUID` usage"] = (test) => {
    exec(`eq group ${group.id}`, (err, stdout, stderr) => {
        handleErr(stderr)
        test.ok(stdout.toString())
        test.ok(!err)
        let data = JSON.parse(stdout.toString())
        test.ok(data.users.includes('stest'))
        test.ok(!data.users.includes('ftest1'))
        test.done()
    })
}

exports["test modifying group with PUT request & retrieving with --name flag"] = (test) => {
    exec(`eq group ${group.id} --method put --data test/fixtures/new-group.json`, (err, stdout, stderr) => {
        // fixtures/new-group.json removes stest1 and adds ftest1
        handleErr(stderr)
        test.ok(!err)
        // @NOTE: oE API returns nothing in the body of a successful PUT/POST
        // request, so stdout.toString() is not informative
        exec(`eq group --name "${group.name}"`, (err, stdout, stderr) => {
            handleErr(stderr)
            test.ok(!err)
            let data = JSON.parse(stdout.toString())
            test.ok(data.users.includes('ftest1'))
            test.ok(!data.users.includes('stest1'))
            test.done()
        })
    })
}

exports["revert group to original state using PUT with --file flag"] = (test) => {
    exec(`eq group ${group.id} --method put --file test/fixtures/original-group.json`, (err, stdout, stderr) => {
        handleErr(stderr)
        test.ok(!err)
        test.done()
    })
}
