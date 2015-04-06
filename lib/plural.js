// taxonomy => taxonomies, role => roles, management/group/ => groups, etc.
module.exports = function (str) {
    var arr = str.replace(/\/$/, '').split('/')
    return arr[arr.length - 1].replace(/y$/, 'ies').replace(/([a-rt-z])$/, '$1s')
}
