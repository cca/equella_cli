# EQUELLA CLI

[![npm version](https://badge.fury.io/js/equella-cli.svg)](https://badge.fury.io/js/equella-cli)

Command line interface to the openEQUELLA REST APIs.

**WARNING** use at your own risk. In particular, `PUT` and `POST` requests do not lock the resources they're editing. Safe for `GET`ting information, though.

## Setup

Install node, install equella-cli globally with `npm i -g equella-cli`, and configure an .equellarc file. The rc file can live in your user's home directory, the working directory where you're running `eq` commands, or any parent of the working directory. Really, [anywhere that `rc` looks](https://github.com/dominictarr/rc#standards). At a bare minimum, the rc file looks like:

```json
{
    "root": "https://equella.mydomain.edu",
    "token": "abcd1234-ab12-1234-12ab-abcd1234abcd"
}
```

Any option listed in [the endpoints documentation](endpoints.md) can also be given a default in the rc file; the name of the configuration option is simply the command line flag minus the two leading hyphens. Values specified on the command line override rc values. Here are some potential options:

```json
{
    "debug": true, // log URLs of all requests to stderr
    "fullterm": false, // don't search full taxonomy term path
    "collections": "6b755832-4070-73d2-77b3-3febcc1f5fad", // search only this collection
}
```

Consult the openEQUELLA REST API guide for instructions on generating an OAUTH token. It involves configuring a client, then visiting https://equella.mydomain.edu/oauth/authorize?response_type=token&client_id=$CLIENT_ID&redirect_uri=default

## Commands

### Miscellaneous

Helpful things. URLs open in your default browser.

`eq help` - help docs for the command itself

`eq login` — sign into EQUELLA using credentials in .equellarc file or `--username` and `--password` flags passed on the command line

`eq docs`, `eq apidocs` — open the API documentation URL

`eq launch` - run the new admin console launcher, requires a `launcherPath` option that points to the script.

`eq admin`, `eq console` — opens the download URL for the EQUELLA admin console Java app

### Raw URL Mode

If you don't use one of the shortcuts for the various API endpoints, `eq` defaults to making HTTP requests to your server. It defaults to HTTP GET but you can specify other methods with the `--method` flag. This fallback allows `eq` to work with API functionality that hasn't been implemented yet.

```sh
eq 'taxonomy/1234-4321-asda-asda-1231' # get specific taxonomy
eq 'collection/?privilege=VIEW_ITEM' # get collections for which you have VIEW_ITEM privilege
eq --method del 'taxonomy/1234-asdasd-1234/term/1231231-1231231' # delete a term
eq settings/advancedsearch # see a list of advanced searches
```

You can combine the endpoint shortcuts below with raw URL requests by appending the rest of the URL onto a shortcut. For instance:

```sh
# list all taxonomy terms using both a shortcut & a specific path
eq tax '1234-4321-asda/term'
```

The `--path` flag is also available for specifying a path that comes after the API endpoint and any UUID. So `eq tax '1234-4321-asda/term` is equivalent to `eq tax 1234-4321-asda --path term`.

## Endpoints

See [the endpoints document](endpoints.md) for documentation on options and shortcuts related to specific API endpoints like taxonomy, groups, search, and items.

## ESM

Starting with version 2.0.0 `eq` is an ECMAScript module while the 1.x.y versions were CommonJS. This change should not affect `eq` command line usage. In general, importing the module as a library is not an anticipated use case and untested.

## Use `jq`

`eq` is at its best in combination with a UNIX JSON utility like [jq](https://stedolan.github.io/jq/). By piping API results through `jq`, it's easier to extract the specific information we want as well as to iterate over results. For this reason, `eq` will not focus on tooling for extracting common fields from EQUELLA's JSON responses. Instead, we use `jq` in combination to achieve want we want, e.g.

```sh
# get the text of all top-level terms in a taxonomy
eq tax --name 'semesters' --terms | jq '.[].term'
# retrieve all the members of a group by its name
# then iterate over them printing out all their usernames (FISH loop, not BASH)
for user in (eq group --name 'system administrators' | jq '.users[]' | tr -d '"'); eq user $user | jq '.username'; end
```

## Invalid SSL Certificates

We can work around unrecognized/invalid SSL certificates in Node by setting the `NODE_TLS_REJECT_UNAUTHORIZED` environment variable to `0`, e.g., `export NODE_TLS_REJECT_UNAUTHORIZED=0` in Bash or `set -gx NODE_TLS_REJECT_UNAUTHORIZED 0` in Fish. Node will print runtime warnings to stderr but otherwise this is a good way to work around certificates our system doesn't recognize as valid yet. openEQUELLA forces you to use HTTPS for most (all?) API routes, so otherwise we're stuck.

## LICENSE

[ECL Version 2.0](https://opensource.org/licenses/ECL-2.0)
