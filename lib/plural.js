// taxonomy => taxonomies, role => roles, etc.
module.exports = function (str) {
    return str.replace(/\/$/, '').replace(/y$/, 'ies').replace(/([a-rt-z])$/, '$1s')
}
