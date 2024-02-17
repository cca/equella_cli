#!/usr/bin/env node
import { readFileSync } from 'node:fs'
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

// version must go first, then help, then other commands
if (options._[ 0 ] === 'version' || options.version || options.v) {
    const pjpath = new URL('./package.json', import.meta.url)
    const app = JSON.parse(readFileSync(pjpath))
    console.log(app.version)
    process.exit(0)
} else if (options._[ 0 ] === 'help' || options.help || options.h || !options._.length) {
    // help documentation
    help(options)
    process.exit(0)
} else if (options.apidocs || options.docs || options._[ 0 ] === 'apidocs' || options._[ 0 ] === 'docs') {
    // API documentation
    const url = options.root + 'apidocs.do'
    console.log('Opening %s', url)
    open(url)
    process.exit(0)
} else if (options.console || options.admin || options._[ 0 ] === 'console' || options._[ 0 ] === 'admin') {
    // admin console
    const url = options.root + 'jnlp/admin.jnlp'
    console.log('Opening %s', url)
    open(url)
    process.exit(0)
} else if (options.login || options._[ 0 ] === 'login') {
    // login via browser automatically
    if (!options.username || !options.password) {
        console.error('Error! Login command requires a username & password in .equellarc or passed on the command line.')
        process.exit(1)
    } else {
        // can pass values to form by referencing their input names in query string
        // "event__" is some magic that triggers an internal EQUELLA function
        // see `onclick=_subev('.authenticate')`` attribute of the log in button
        open(`${options.root}logon.do?_username=${options.username}&_password=${options.password}&event__=.authenticate`)
        process.exit(0)
    }
}

// we're headed to an API route so modify the URL
options.root += 'api/'
import {eq} from './index.js'
eq(options)
