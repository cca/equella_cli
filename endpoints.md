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
