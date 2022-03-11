### Endpoints

A series of configured endpoint shortcuts are available. A common feature of these shortcuts is that they allow you to retrieve an object by its _name_ (case insensitive) rather than its UUID.

#### Collections

Shortcuts: coll, collection, collections

```sh
> # look up collection by name
> eq coll --name 'Syllabus Collection'
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

#### Search

Shortcuts: s, search

```sh
> # XML query, note comparison must be wrapped in single quotes
> eq search --where "/mods/name/namePart LIKE 'Mike*'"
> # complex query, *all* the parameters
> eq search --query 'free text query' --order modified --start 10 --length 30 --collections 6b755832-4070-73d2-77b3-3febcc1f5fad --showall --info metadata
> # same query as above but using all shorthand flags
> eq s -q 'free text query' -o mod --start 10 -l 30 -c 6b755832-4070-73d2-77b3-3febcc1f5fad --all -i md
```

There are many search filters that can be applied; it's best to review openEQUELLA's API docs to fully understand your options. This endpoint supports the following parameters (with their shortcuts in parenthesis):

- query (q): free text query
- start: item to start on (for paging through multiple results lists)
- length (l): number of items to return (max 50)
- collections (coll, c): comma-separated list of collection UUIDs to search
- order (o): what metadata to sort the results by. The options are name, date modified (modified), rating, & relevance.
- where (w): XPath-like "where" clause e.g. `--where="/metadata/title LIKE 'HELLO WORLD*'"`
- info (i): what data to include in the results. The options are all, attachment, basic, detail, drm, metadata, & navigation. Note that results _do not_ include their XML metadata unless you ask for it in the "info" parameter.
- modifiedAfter (ma) & modifiedBefore (mb): narrow by date modified, these are `YYYY-MM-DD` dates
- owner: the user that owns the item. Only accepts one username (for external users) or UUID (for local/internal ones).
- showall (all, show): boolean flag that defaults to `false`, include items that are not yet live, e.g. draft, archive, suspended, etc. statuses
- reverse (r): boolean flag that defaults to `false`, reverse the order of the results

The order and info parameters are validated against their possible options and have various shortcuts for common values, e.g. `--info=xml` for metadata.

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

I haven't found success looking up a term multiple layers deep into a taxonomy hierarchy, e.g. "Spring\\2015" but perhaps it's because I'm not escaping the slash properly.

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
