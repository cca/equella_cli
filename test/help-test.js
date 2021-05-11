const exec = require('child_process').exec
const handleErr = (e) => { if (e) console.error(e) }

exports["argument usage like `eq help $ENDPOINT` works"] = (test) => {
    exec('eq help taxo', (err, stdout, stderr) => {
        handleErr(stderr)
        test.ok(stdout.toString().length > 0)
        test.ok(!err)
        test.done()
    })
}

exports["flag usage like `eq $ENDPOINT --help` works"] = (test) => {
    exec('eq search --help', (err, stdout, stderr) => {
        handleErr(stderr)
        test.ok(stdout.toString().length > 0)
        test.ok(!err)
        test.done()
    })
}

exports["general `eq help` works"] = (test) => {
    exec('eq help', (err, stdout, stderr) => {
        handleErr(stderr)
        test.ok(stdout.toString().length > 0)
        test.ok(!err)
        test.done()
    })
}

exports["`eq` with no other args prints help"] = (test) => {
    exec('eq', (err, stdout, stderr) => {
        handleErr(stderr)
        test.ok(stdout.toString().length > 0)
        test.ok(!err)
        test.done()
    })
}
