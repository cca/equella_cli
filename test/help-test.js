import assert from 'node:assert'
import { exec } from 'node:child_process'

const handleErr = (e) => { if (e) console.error(e) }

describe("eq help", () => {
    it("argument usage like `eq help $ENDPOINT` works", (done) => {
        exec('eq help taxo', (err, stdout, stderr) => {
            handleErr(stderr)
            assert.ok(stdout.toString().length > 0)
            assert.ok(!err)
            done()
        })
    })

    it("flag usage like `eq $ENDPOINT --help` works", (done) => {
        exec('eq search --help', (err, stdout, stderr) => {
            handleErr(stderr)
            assert.ok(stdout.toString().length > 0)
            assert.ok(!err)
            done()
        })
    })

    it("general `eq help` works", (done) => {
        exec('eq help', (err, stdout, stderr) => {
            handleErr(stderr)
            assert.ok(stdout.toString().length > 0)
            assert.ok(!err)
            done()
        })
    })

    it("`eq` with no other args prints help", (done) => {
        exec('eq', (err, stdout, stderr) => {
            handleErr(stderr)
            assert.ok(stdout.toString().length > 0)
            assert.ok(!err)
            done()
        })
    })
})
