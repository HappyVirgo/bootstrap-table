# bootstrap table

[![Build Status](https://travis-ci.org/wenzhixin/bootstrap-table.png)](https://travis-ci.org/wenzhixin/bootstrap-table)

Bootstrap table displays data in a tabular format and offers rich support to radio, checkbox, sort, pagination and so on. The table has been designed to reduce development time and to require no specific knowledge from developers. It is both featherweight and feature-rich.

* [Documentation](http://wenzhixin.net.cn/p/bootstrap-table/docs/documentation.html)
* [Examples](http://wenzhixin.net.cn/p/bootstrap-table/docs/examples.html)
* [JSFiddle Examples](https://github.com/wenzhixin/bootstrap-table/blob/master/docs/jsfiddle-examples.md)
* [Extensions](http://wenzhixin.net.cn/p/bootstrap-table/docs/extensions.html)


## LICENSE

**NOTE:** Bootstrap Table is licensed under the [The MIT License](https://github.com/wenzhixin/bootstrap-table/blob/master/LICENSE). Completely free, you can arbitrarily use and modify this plugin. If this plugin is useful to you, you can **Star** this repo, your support is my biggest motive force, thanks.

## Bugs & Enhancements (next version)

- [x] Take `showHeader` option effect to the card view.
- [x] Rename and update locale files.
- [x] Fix #102: Wrong `options.columns` initialization.
- [x] Fix #121: Add extensions for bootstrap table.
- [x] Fix #138: IE8 search data and remove method error.
- [x] Fix bug: sorter does not work in some case.
- [x] Add `bootstrap-table-nl-NL.js` and `bootstrap-table-el-GR.js`.
- [x] Support search without data-field set, trim search input.
- [x] Fix #81: Allow the `class` to be applied to the radio or checkbox row.
- [x] Fix #135, #142: Search use formatted data.
- [x] Verify search text before send queryParams.
- [x] Fix #148: column events support namespace.

## Features

* Created for Bootstrap 3 (Bootstrap 2 supported)
* Responsive web design
* Scrollable Table with fixed headers
* Fully configurable
* Via data attributes
* Show/Hide columns
* Show/Hide headers
* Get data in JSON format using AJAX
* Simple column sorting with a click
* Format column
* Single or multiple row selection
* Powerful pagination
* Card view
* Localization

## How to get it

### Manual download

Use [Releases page](https://github.com/wenzhixin/bootstrap-table/releases) or [the source](https://github.com/wenzhixin/bootstrap-table/archive/master.zip).

### Bower

```
bower install bootstrap-table
```

### CDN

You can source bootstrap-table directly from a CDN like [CDNJS](http://www.cdnjs.com/libraries/bootstrap-table) or [bootcss](http://open.bootcss.com/bootstrap-table/).

## Reporting issues

Please provide jsFiddle when creating issues!

It's really saves much time. Use this as template:

[jsFiddle Bootstrap Table](http://jsfiddle.net/8svjf80g/1/)

Your feedback is very appreciated!

## Acknowledgements

Thanks to everyone who have given feedback and submitted pull requests. A list of all the contributors can be found [here](https://github.com/wenzhixin/bootstrap-table/blob/master/CONTRIBUTORS.md).

## Release History

Look at the [Change Log](https://github.com/wenzhixin/bootstrap-table/blob/master/CHANGELOG.md)

## Local build

To build bootstrap-table locally please run:

```
grunt build
```

Result will appear in `dist` directory.
