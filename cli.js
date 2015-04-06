#!/usr/bin/env node
var open = require('opn')
var path = require('path')
var req = require(path.join(process.cwd(), 'lib', 'req'))
var defaults = {
    method: 'get',
    raw: true
}
var options = require('rc')('equella', defaults)

// API documentation
if (options.apidocs || options.docs || options._[0] === 'apidocs' || options._[0] === 'docs') {
    var url = options.root.replace(/api\/$/,'apidocs.do')
    console.log('Opening %s', url)
    open(url)
    process.exit(0)
// admin console
} else if (options.console || options.admin || options._[0] === 'console' || options._[0] === 'admin') {
    var url = options.root.replace(/api\/$/,'admin.jnlp')
    console.log('Opening %s', url)
    open(url)
    process.exit(0)
}

require('./index')(options)
