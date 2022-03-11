/**
 * return a readable list with an ending conjunction, e.g. for printing
 * arrays in help messages. list([ONE, TWO, THREE], 'and') => ONE, TWO, and THREE
 *
 * @param   {Array[String]}  array             items to be listed, should be strings or
 * trivial to cast to strings (e.g. integers are fine, too)
 * @param   {String}  coordinatingConjunction  ending for the list, e.g. "and",
 * "or", "and/or". Defaults to "and".
 * @param   {String}  separator                separator between list items, defaults
 * to a comma followed by a space ", ".
 * @param   {Boolean}  sort                    sort the array first, defaults to false
 *
 * @return  {String}                           readable list of array items
 */
module.exports = function list(array, coordinatingConjunction = 'and', separator = ', ', sort = false) {
    if (sort) array = array.sort()
    let last_item = array.pop()
    switch (array.length) {
        case 1:
            return array[0]
        case 2:
            return array.join(` ${coordinatingConjunction} `)
        default:
            return `${array.join(separator)}${separator}${coordinatingConjunction} ${last_item}`
    }
}
