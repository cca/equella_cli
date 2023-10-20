#!/usr/bin/env node
import readFileSync from 'node:fs'
import resolve from 'node:path'
import open from 'open'
import rc from 'rc'
import help from './lib/help.js'
import validate from './lib/validate-options.js'
import normalize from './lib/normalize-root.js'

let options = rc('equella', { method: 'get' })
validate(options)
options.root = normalize(options.root)

// these options will only apply on command line
// so no need to represent elsewhere e.g. in index.js

// help documentation must go first
if (options._[0] === 'help' || options.help || options.h || !options._.length) {
    help(options)
    process.exit(0)
// API documentation
} else if (options.apidocs || options.docs || options._[0] === 'apidocs' || options._[0] === 'docs') {
    const url = options.root + 'apidocs.do'
    console.log('Opening %s', url)
    open(url)
    process.exit(0)
// admin console
} else if (options.console || options.admin || options._[0] === 'console' || options._[0] === 'admin') {
    const url = options.root + 'jnlp/admin.jnlp'
    console.log('Opening %s', url)
    open(url)
    process.exit(0)
// version number
} else if (options._[0] === 'version') {
    const data = readFileSync(resolve(__dirname, 'package.json'))
    const pkg = JSON.parse(data)
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
        const url = options.root + [
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
import {eq} from './index.js'
eq(options)
