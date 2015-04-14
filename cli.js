#!/usr/bin/env node
var open = require('opn')
var req = require('./lib/req')
var defaults = {
    method: 'get',
    raw: true
}
var options = require('rc')('equella', defaults)
require('./lib/validate-options')(options)

// API documentation
if (options.apidocs || options.docs || options._[0] === 'apidocs' || options._[0] === 'docs') {
    var url = options.root.replace(/api\/$/,'apidocs.do')
    console.log('Opening %s', url)
    open(url)
    process.exit(0)
// admin console
} else if (options.console || options.admin || options._[0] === 'console' || options._[0] === 'admin') {
    var url = options.root.replace(/api\/$/,'jnlp/admin.jnlp')
    console.log('Opening %s', url)
    open(url)
    process.exit(0)
}

require('./index')(options)
