# EQUELLA CLI

Command line interface to the EQUELLA REST APIs.

**WARNING** very much beta, use at your risk. In particular, `PUT` and `POST` requests don't yet lock the resources they're editing. Pretty usable for `GET`ting information, though.

## Setup

Install node or [io.js](https://iojs.org) along with `npm`, install equella-cli globally with `npm i -g equella-cli`, and finally configure an .equellarc file. The rc file can live in your user's home directory, the working directory where you're running `eq` commands, or any parent of the working directory. Really, [anywhere that `rc` looks](https://github.com/dominictarr/rc#standards). At a bare minimum, the rc file looks like:

```js
{
    "root": "https://equella.mydomain.edu/api/",
    "token": "abcd1234-ab12-1234-12ab-abcd1234abcd"
}
```

See the EQUELLA REST API guide for instructions on generating an OAUTH token. It generally involves configuring a client, then visiting https://equella.mydomain.edu/oauth/authorize?response_type=token&client_id={{your client ID}}&redirect_uri=default

## Additional Options

**debug** — log request URLs to stderr (so you can still pipe output to a file without the debugging messages)

## Commands

### Miscellaneous

Helpful things. URLs open in your default browser.

`eq docs`, `eq apidocs` — open the API documentation URL

`eq admin`, `eq console` — opens the download URL for the EQUELLA admin console Java app

### Raw URL Mode

If you don't use one of the shortcuts for the various API endpoints, `eq` defaults to making HTTP requests to your server. It defaults to HTTP GET but you can specify other methods with the `--method` flag. This fallback allows `eq` to work with API functionality that hasn't been implemented yet.

```sh
> eq 'taxonomy/1234-4321-asda-asda-1231' # get specific taxonomy
> eq 'collection/?privilege=VIEW_ITEM' # get collections for which you have VIEW_ITEM privilege
> eq --method delete 'taxonomy/1234-asdasd-1234/term/1231231-1231231' # delete a term
```

You can combine the endpoint shortcuts below with raw URL requests by appending the rest of the URL onto a shortcut. For instance:

```sh
> # list all taxonomy terms using both a shortcut & a specific path
> eq tax '1234-4321-asda-asda-1231/term'
```

The `--path` flag is also available for specifying a path after an endpoint.

### Endpoints

A series of configured endpoint shortcuts are available. A common feature of these shortcuts is that they allow you to retrieve an object by its _name_ (case insensitive, usually) rather than its UUID.

#### Collections

Shortcuts: coll, collection, collections

```sh
> # look up collection by name
> eq coll --name 'Syllabus Collection' # -q also works
```

To query EQUELLA collection info, by default you need to pass a "privilege" (EQUELLA permission) that the API account will have with the `--privilege` flag or in the URL path. `eq` defaults to `VIEW_ITEM` if you don't provide a privilege.

#### (Internal) Groups

Shortcuts: group, groups

```sh
> # look up group by name
> eq group --name 'Photography Faculty'
```

#### Items

Shortcuts: item

```sh
> # query item XML metadata using xpath with -x or --xp flags
> eq item '1234-abcd-1234-ab12cd34' --xp '//mods/titleInfo/title/text()'
> # using --text will automatically append '/text()' onto the xpath
> eq item '1234-abcd-1234-ab12cd34' -x '//mods/titleInfo/title' --text
```

#### (Internal) Roles

Shortcuts: role, roles

```sh
> # look up role by (case sensitive) name
> eq role --name 'Student Contributor Role'
```

#### Taxonomy

Shortcuts: tax, taxo, taxonomy

```sh
> # look up taxonomy by name instead of UUID
> eq tax --name 'Semesters'
> # get all the top-level terms
> eq tax --name 'Semesters' --terms
> # look up a term or branch of terms within a taxonomy
> eq tax --name 'Semesters' --term 'Spring 2015'
```

I haven't had success with looking up a term multiple layers deep into a taxonomy hierarchy, e.g. "Spring\\2015" but perhaps it's because I'm not escaping the slash properly.

Searching taxonomy terms is also supported, with options for all the search API settings. By default, the taxonomy term search looks in the full term, isn't restricted to top-level or leaf terms, and uses the default limit of 20 search results.

```sh
> # search leaf (bottom of hierarchy) terms only
> eq tax --name 'semesters' -s 'Spring 2014' --leaf
> # search top-level terms only & get more results
> eq tax --name 'semesters' -s 'Spring 2014' --top --limit 50
> # don't search the full term path
> eq tax --name 'semesters' -s 'Fall 2013' --fullterm=false
```

#### (Internal) Users

Shortcuts: user, users

```sh
> # look up user by (case sensitive) name
> eq user --name 'xsun1' # -q also works
```

## Use `jq`

`eq` is really at its best in combination with a UNIX JSON utility like [jq](https://stedolan.github.io/jq/). By piping API results through `jq`, it's easier to extract the specific information we want as well as to iterate over results. For this reason, `eq` will not focus on tooling for extracting common fields from EQUELLA's JSON responses. Instead, we use `jq` in combination to achieve want we want, e.g.

```sh
> # get the text of all top-level terms in a taxonomy
> eq tax --name 'semesters' --append '/term' | jq '.[].term'
> # retrieve all the members of a group by its name
> # then iterate over them printing out all their usernames (FISH loop, not BASH)
> for user in (eq group --name 'system administrators' | jq '.users[]' | tr -d '"'); eq user $user | jq '.username'; end
```

## LICENSE

[Apache Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
