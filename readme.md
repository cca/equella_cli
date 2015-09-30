# EQUELLA CLI

Command line interface to the EQUELLA REST APIs.

**WARNING** very much beta, use at your own risk. In particular, `PUT` and `POST` requests don't yet lock the resources they're editing. Pretty usable for `GET`ting information, though.

## Setup

Install node or [io.js](https://iojs.org) along with `npm`, install equella-cli globally with `npm i -g equella-cli`, and finally configure an .equellarc file. The rc file can live in your user's home directory, the working directory where you're running `eq` commands, or any parent of the working directory. Really, [anywhere that `rc` looks](https://github.com/dominictarr/rc#standards). At a bare minimum, the rc file looks like:

```js
{
    "root": "https://equella.mydomain.edu",
    "token": "abcd1234-ab12-1234-12ab-abcd1234abcd"
}
```

Any option listed in [the endpoints documentation](endpoints.md) can also be given a default in the rc file; the name of the configuration option is simply the command line flag minus the two leading hyphens. Values specified on the command line override rc values. Here are some potential options:

```js
{
    "debug": true, // log URL requests to stderr
    "fullterm": false, // don't search full taxonomy term path
    "leaf": true, // search leaf (bottom of hierarchy) taxonomy terms only
    "top": true, // search top-level taxonomy terms only
    "username": "foo", // for signing into EQUELLA automatically via `login` command
    "password": "bar"
}
```

Consult the EQUELLA REST API guide for instructions on generating an OAUTH token. It involves configuring a client, then visiting https://equella.mydomain.edu/oauth/authorize?response_type=token&client_id={{your client ID}}&redirect_uri=default

## Commands

### Miscellaneous

Helpful things. URLs open in your default browser.

`eq login` — sign into EQUELLA using credentials in .equellarc file or `--username` and `--password` flags passed on the command line

`eq docs`, `eq apidocs` — open the API documentation URL

`eq admin`, `eq console` — opens the download URL for the EQUELLA admin console Java app

### Raw URL Mode

If you don't use one of the shortcuts for the various API endpoints, `eq` defaults to making HTTP requests to your server. It defaults to HTTP GET but you can specify other methods with the `--method` flag. This fallback allows `eq` to work with API functionality that hasn't been implemented yet.

```sh
> eq 'taxonomy/1234-4321-asda-asda-1231' # get specific taxonomy
> eq 'collection/?privilege=VIEW_ITEM' # get collections for which you have VIEW_ITEM privilege
> eq --method del 'taxonomy/1234-asdasd-1234/term/1231231-1231231' # delete a term
```

You can combine the endpoint shortcuts below with raw URL requests by appending the rest of the URL onto a shortcut. For instance:

```sh
> # list all taxonomy terms using both a shortcut & a specific path
> eq tax '1234-4321-asda-asda-1231/term'
```

The `--path` flag is also available for specifying a path after an endpoint.

## Endpoints

See [the endpoints document](endpoints.md) for documentation on options and shortcuts related to specific API endpoints like taxonomy, groups, and items.

## Use `jq`

`eq` is really at its best in combination with a UNIX JSON utility like [jq](https://stedolan.github.io/jq/). By piping API results through `jq`, it's easier to extract the specific information we want as well as to iterate over results. For this reason, `eq` will not focus on tooling for extracting common fields from EQUELLA's JSON responses. Instead, we use `jq` in combination to achieve want we want, e.g.

```sh
> # get the text of all top-level terms in a taxonomy
> eq tax --name 'semesters' --terms | jq '.[].term'
> # retrieve all the members of a group by its name
> # then iterate over them printing out all their usernames (FISH loop, not BASH)
> for user in (eq group --name 'system administrators' | jq '.users[]' | tr -d '"'); eq user $user | jq '.username'; end
```

## LICENSE

[Apache Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
