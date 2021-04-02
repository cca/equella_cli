// hash of endpoints & their help docs
// @TODO several haven't been filled in with all their details yet
let docs = {
    collection: `eq collection [UUID] - look up collection information

    --name [NAME]       search for a collection by name rather than UUID
    --privilege [CODE]  query collections where the OAuth token user has this
    all-caps privilege coded like VIEW_ITEM (the default if none is specified).`,

    group: `eq group UUID - view internal group information, including group members

    --name [NAME]   search for an internal group by name rather than UUID`,

    help: `eq [API ENDPOINT | URL] [OPTIONS] [UUID | NAME]

Interact with the openEQUELLA REST API. Requires a configured .equellarc
file with _at least_ a "token" OAuth token property.

Options common to many API endpoints:
    --method    HTTP method e.g. PUT, POST, DELETE. Defaults to GET.
    --name      retrieve oE object by its name & not UUID

List of API endpoints:
    admin       open link to admin console (for pre-launcher app versions of oE)
    apidocs     open the API documentation in a browser
    collection  retrieve lists of collections, their UUIDs from their names
    groups      internal user groups
    help        eq documentation on these endpoints
    hierarchy   retrieve lists of hierarchies, their UUIDs from their names
    item        find & manipulate specific items
    login       authenticate in a browser using credentials in .equellarc
    role        internal roles
    search      find many items at once using all oE search features
    settings    open various settings URLs in a browser
    taxonomy    find taxonomies or specific terms within them
    user        internal users

See "eq help [ENDPOINT]" for details. Most endpoints have specific flags
and features.

If eq doesn't recognize an endpoint it uses raw URL mode to make direct
requests to the API e.g. "eq taxonomy/1234-4321-asda-asda-1231" which is
equivalent to "eq tax 1234-4321-asda-asda-1231".`,

    // @TODO technically browserhierarchy & hierarchy are different endpoints
    hierarchy: `eq hierarchy [UUID] - browse hierarchy information

This is a rudimentary implementation of the EQUELLA API endpoint.

    --name [NAME]   search for a hierachy by name rather than UUID`,

    item: `eq item [UUID] - look up item information

Items cannot be retreived by name; you need to already know their UUID. See the
"search" endpoint for more ways to find item information.

    -x, --xp XPATH:     return the metadata node specified by XPATH
    --text:             return text content of the node instead of XML`,

    role: `eq role [UUID] - look up internal user role information

    --name [NAME]   search for a role by name rather than UUID`,

    search: `eq search [QUERY] - search for items.

There are many filtering options. At least one must be specified e.g. -q for
query or --owner.

    -c, --collections: comma-separated list of collection UUIDs
    -i, --info TYPE: the amount or type data to return, choices are all,
        attachment, (a.k.a "file" or "files"), basic, detail, drm, metadata
        (a.k.a. "md" or "xml"), and navigation (or "nav")
    -l, --length INT: number of results to return (default 10, max 50)
    --ma, --modifiedAfter DATE: results modified after DATE (YYYY-MM-DD)
    --mb, --modifiedBefore DATE: results modified before DATE (YYYY-MM-DD)
    -o, --order OPTION: ordering principle, choices are modified (a.k.a "date"
        or "mod"), name (a.k.a. "alpha", "nm", or "title"), rating (a.k.a.
        "star" or "stars"), and relevance (a.k.a. "rel")
    --owner [ USERNAME | UUID ]: items owned by a given user. Accepts username
        for external (e.g. LDAP, SSO) users and UUID for internal users.
    -q, --query TEXT: free-text query searched over all indexed metadata fields
    --reverse: boolean to return results in reverse
    --showall, --all, --show: boolean to return non-live (unpublished) items
    --start INT: offset for first result (use for paging through results)
    -w, --where: XPath-like "where" query similar to Manage Resources, e.g.
        '/xml/metadata/title LIKE "Beloved%"' (double-quote strings, must begin
        with /xml)`,

    settings: `eq settings [SHORTCUT] - open the settings page for "shortcut"

Available shortcuts:
    dash, dashboard - dashboard settings
    datafixes, manualdata, manualdatafixes, mdf, reindex - manual data fixes (thumbnails, PDF reindexing)
    diag, diagnostic(s) - user LDAP group diagnostics
    lang, language - language pack
    liu, loggedin, logged-in - currently logged in users
    mime, mimetype(s), mime-type(s) - MIME type settings including file icon & viewer
    short, shortcuts, shortlinks - add/delete internal shortlinks
    theme - theme settings`,

    // @TODO lot more to document here
    taxonomy: `eq taxonomy UUID - look up taxonomy information

    --name [NAME]   search for a taxonomy by name rather than UUID`,

    user: `eq user UUID - look up an internal (not LDAP, SSO, etc.) user account

Cannot retrieve users by their name or username, though this feature may be
added in the future.`,
}

// aliases, couldn't find an elegant way to do property aliases in the hash
docs.browse = docs.hier = docs.hierarchy
docs.coll = docs.collections = docs.collection
docs.groups = docs.group
docs.items = docs.item
docs.roles = docs.role
docs.s = docs.search
docs.set = docs.acc = docs.access = docs.settings
docs.tax = docs.taxo = docs.taxonomy
docs.users = docs.user

module.exports = function (options) {
    let endpoint = options._[0]
    if (endpoint === 'help' && options._[1]) {
        // covers `eq help $ENDPOINT` usage
        endpoint = options._[1]
    }
    else if (endpoint === undefined) {
        // treat undefined endpoint as help, covers `eq -h` & `eq --help`
        endpoint = 'help'
    }

    if (endpoint in docs) {
        console.log(docs[endpoint])
        return process.exit(0)
    } else {
        console.error(`unrecognized API endpoint "${endpoint}"`)
        return process.exit(1)
    }

}
