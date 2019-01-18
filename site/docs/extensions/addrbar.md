---
layout: docs
title: Table Addrbar
description: Table Addrbar extension of Bootstrap Table.
group: extensions
toc: true
---

Every time when changing page, sorting and searching operation, it will change the query params of the address bar. And while page loading, this plugin will use the query params in the address bar to make the request.

## Usage

{% highlight html %}
<script src="extensions/addrbar/bootstrap-table-addrbar.js"></script>
{% endhighlight %}

## Options

### addrbar

- **Type:** `Boolean`

- **Detail:**

  Set to `true` if you want to use the addrbar feature.

- **Default:** `false`

### addrPrefix

- **Type:** `String`

- **Detail:**

  The prefix of the query params, it should be used for multi tables.

  While there are many tables in one page, and you want each of them can use this, then you may need the `addrPrefix` option.

  There are 5 parameters in default. They are

  * `page`: page number
  * `limit`: page size
  * `order`: asc/dsc
  * `sort`: the sort keyword
  * `search`: search keyword

  If you want each table can use this plugin, this parameters will make the tables bothering each other. The `addrPrefix` filed will get the tables a unique prefix to avoid.

- **Default:** `''`

## Note

* Can not use in client pagination.

* The example page doesn't handle the sort and search operation, you need do it yourself.

* While search field appeared, the page number will return to 1 when refresh, you can read [同时设置pageNumber和searchText初始值会冲突](https://github.com/wenzhixin/bootstrap-table/issues/2580).
