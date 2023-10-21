// test both group API endpoint and using HTTP PUT to modify a group
// ! this test requires a test group with a UUID referenced inside
// ! test/fixtures/original-group.json & test/fixtures/new-group.json
import assert from 'node:assert'
import { exec } from 'node:child_process'
import { readFileSync } from 'node:fs'
const group = JSON.parse(readFileSync('./test/fixtures/original-group.json'))

const handleErr = (e) => { if (e) console.error(e) }

describe("eq group", () => {
    it('should get group information', (done) => {
        exec(`eq group ${group.id}`, (err, stdout, stderr) => {
            handleErr(stderr)
            assert.ok(stdout.toString())
            assert.ok(!err)
            let data = JSON.parse(stdout.toString())
            assert.ok(data.users.includes('stest'))
            assert.ok(!data.users.includes('ftest1'))
            done()
        })
    }).timeout(5000)

    it('should modify group with a PUT request & retrieving it with --name flag', (done) => {
        exec(`eq group ${group.id} --method put --data test/fixtures/new-group.json`, (err, stdout, stderr) => {
            // fixtures/new-group.json removes stest1 and adds ftest1
            handleErr(stderr)
            assert.ok(!err)
            // ! oE API returns nothing in the body of a successful PUT/POST
            // ! request, so stdout.toString() is not informative
            exec(`eq group --name "${group.name}"`, (err, stdout, stderr) => {
                handleErr(stderr)
                assert.ok(!err)
                let data = JSON.parse(stdout.toString())
                assert.ok(data.users.includes('ftest1'))
                assert.ok(!data.users.includes('stest1'))
                done()
            })
        })
    }).timeout(5000)

    it('should with a PUT using --file flag', (done) => {
        // this reverts the change made above
        exec(`eq group ${group.id} --method put --file test/fixtures/original-group.json`, (err, stdout, stderr) => {
            handleErr(stderr)
            assert.ok(!err)
            done()
        })
    }).timeout(5000)
})
