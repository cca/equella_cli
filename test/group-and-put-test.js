// test both group API endpoint and using HTTP PUT to modify a group
// ! E2E tests requires a test group with a UUID referenced inside
// ! test/fixtures/original-group.json & test/fixtures/new-group.json
import assert from 'node:assert'
import { exec } from 'node:child_process'
import { readFileSync } from 'node:fs'
import rc from 'rc'
import group from '../endpoints/group.js'
import { isE2E, useMockMode, useE2EMode, mockResponse, cleanup } from './test-utils.js'

const groupData = JSON.parse(readFileSync('./test/fixtures/original-group.json'))

const handleErr = (e) => {if (e) console.error(e)}

const testConfig = rc('equella', {
    method: 'get',
    endpoint: '/api/usermanagement/local/group/',
})

// For mocked mode, override with test-specific config
if (!isE2E) {
    testConfig.token = 'test-token'
    testConfig.root = 'https://localhost'
}

describe("eq group", () => {
    if (isE2E) {
        before(useE2EMode)
        this.timeout(5000) // group modifications can be slow in E2E
    } else {
        before(useMockMode)
    }

    after(cleanup)

    it('should get group information', (done) => {
        if (isE2E) {
            exec(`eq group ${groupData.id}`, (err, stdout, stderr) => {
                handleErr(stderr)
                assert.ok(stdout.toString())
                assert.ok(!err)
                let data = JSON.parse(stdout.toString())
                assert.ok(data.users.includes('stest'))
                assert.ok(!data.users.includes('ftest1'))
                done()
            })
        } else {
            mockResponse(`/api/usermanagement/local/group/${groupData.id}`, 'get', { ...groupData })
            const opts = { ...testConfig, path: groupData.id }
            group(opts, (data) => {
                assert.ok(data)
                assert.ok(data.users.includes('stest'))
                assert.ok(!data.users.includes('ftest1'))
                done()
            })
        }
    })

    it('should modify group with a PUT request & retrieve it with --name flag', (done) => {
        if (isE2E) {
            exec(`eq group ${groupData.id} --method put --data test/fixtures/new-group.json`, (err, stdout, stderr) => {
                // fixtures/new-group.json removes stest1 and adds ftest1
                handleErr(stderr)
                assert.ok(!err)
                // oE API returns nothing in the body of a successful PUT/POST to Groups
                // but putOrPostCb() in req.js should return the status code
                assert.ok(stdout.toString() === "200")
                exec(`eq group --name "${groupData.name}"`, (err, stdout, stderr) => {
                    handleErr(stderr)
                    assert.ok(!err)
                    let data = JSON.parse(stdout.toString())
                    assert.ok(data.users.includes('ftest1'))
                    assert.ok(!data.users.includes('stest1'))
                    done()
                })
            })
        } else {
            mockResponse(`/api/usermanagement/local/group/${groupData.id}`, 'put', '', 200)
            // group() with name options is actually 2 HTTP requests
            // 1) GET by name which returns an array of groups
            mockResponse(`/api/usermanagement/local/group/?length=5000`, 'get', 'group-list-response.json', 200)
            // 2) GET the individual group by UUID
            mockResponse(`/api/usermanagement/local/group/${groupData.id}`, 'get', 'group-updated-response.json', 200)

            const putOpts = { ...testConfig, path: groupData.id, method: 'put', file: 'test/fixtures/new-group.json' }
            group(putOpts, (status) => {
                assert.ok(status === 200)
                // After PUT, retrieve updated group by name & confirm changes
                group({...testConfig, name: groupData.name}, (data) => {
                    assert.ok(data.users.includes('ftest1'))
                    assert.ok(!data.users.includes('stest1'))
                    done()
                })
            })
        }
    })

    it('should work with a PUT using --file flag', (done) => {
        if (isE2E) {
            // this reverts the change made above
            exec(`eq group ${groupData.id} --method put --file test/fixtures/original-group.json`, (err, stdout, stderr) => {
                handleErr(stderr)
                assert.ok(!err)
                assert.ok(stdout.toString() === "200")
                done()
            })
        } else {
            mockResponse(`/api/usermanagement/local/group/${groupData.id}`, 'put', '', 200)

            const opts = { ...testConfig, path: groupData.id, method: 'put', file: './test/fixtures/original-group.json' }
            group(opts, (status) => {
                assert.ok(status === 200)
                done()
            })
        }
    })
})
