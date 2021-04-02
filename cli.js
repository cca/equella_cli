#!/usr/bin/env node
var fs = require('fs')
var path = require('path')
var open = require('opn')
var help = require('./lib/help')
var defaults = {
    method: 'get',
    raw: true
}
var options = require('rc')('equella', defaults)
require('./lib/validate-options')(options)
options.root = require('./lib/normalize-root')(options.root)

// these options will only apply on command line
// so no need to represent elsewhere e.g. in index.js

// help documentation must go first
if (options._[0] === 'help' || options.help || options.h) {
    return help(options)
// API documentation
} else if (options.apidocs || options.docs || options._[0] === 'apidocs' || options._[0] === 'docs') {
    var url = options.root + 'apidocs.do'
    console.log('Opening %s', url)
    open(url)
    process.exit(0)
// admin console
} else if (options.console || options.admin || options._[0] === 'console' || options._[0] === 'admin') {
    var url = options.root + 'jnlp/admin.jnlp'
    console.log('Opening %s', url)
    open(url)
    process.exit(0)
// version number
} else if (options.version) {
    var data = fs.readFileSync(path.resolve(__dirname, 'package.json'))
    var pkg = JSON.parse(data)
    console.log(pkg.version)
    process.exit(0)
    // login via browser automatically
} else if (options.login || options._[0] === 'login') {
    if (!options.username || !options.password) {
        console.error('Error! Login command requires a username & password in .equellarc or passed on the command line.')
        process.exit(1)
    } else {
        // can pass values to form by referencing their input names in query string
        // "event__" is some magic that triggers an internal EQUELLA function
        // see `onclick=_subev('.authenticate')`` attribute of the log in button
        var url = options.root + [
                'logon.do?_username=',
                options.username,
                '&_password=',
                options.password,
                '&event__=.authenticate'].join('')
        open(url)
        process.exit(0)
    }
}

// we're headed to an API route so modify the URL
options.root += 'api/'
require('./index')(options)
