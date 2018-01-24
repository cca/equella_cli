// hash of endpoints & their help docs
// @TODO several haven't been filled in with all their details yet
let docs = {
    collection: `eq collection [UUID] - look up collection information

    --name [NAME] - search for a collection by name rather than UUID`,

    group: `eq group UUID - view internal group information, including group members

    --name [NAME] - search for an internal group by name rather than UUID`,

    hierarchy: `eq hierarchy [UUID] - browse hierarchy information

This is a rudimentary implementation of the EQUELLA API endpoint.

    --name [NAME] - search for a hierachy by name rather than UUID`,

    item: `eq item [UUID] - look up item information`,

    role: `eq role [UUID] - look up internal role information`,

    search: `eq search [QUERY] - search for items`,

    settings: `eq settings [SHORTCUT] - open the settings page for "shortcut"

these are the available shortcuts:
    dash, dashboard - dashboard settings
    datafixes, manualdata, manualdatafixes, mdf, reindex - manual data fixes (thumbnails, PDF reindexing)
    diag, diagnostic(s) - user LDAP group diagnostics
    lang, language - language pack
    liu, loggedin, logged-in - currently logged in users
    mime, mimetype(s), mime-type(s) - MIME type settings including file icon & viewer
    short, shortcuts, shortlinks - add/delete internal shortlinks
    theme - theme settings`,

    taxonomy: `eq taxonomy UUID - look up taxonomy information`,

    user: `eq user UUID - look up _internal_ (not LDAP!) user account`,
}

// aliases, couldn't find an elegant way to do property aliases in the hash
docs.set = docs.acc = docs.access = docs.settings
docs.browse = docs.hier = docs.hierarchy
docs.coll = docs.collections = docs.collection
docs.groups = docs.group
docs.roles = docs.role
docs.s = docs.search
docs.tax = docs.taxo = docs.taxonomy
docs.users = docs.user

module.exports = function (options) {
    let endpoint = options._[0]

    if (endpoint in docs) {
        console.log(docs[endpoint])
        return process.exit(0)
    } else {
        console.error(`unrecognized API endpoint "${endpoint}"`)
        return process.exit(1)
    }

}
