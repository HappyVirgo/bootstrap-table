$(function () {
    'use strict';

    function initTables() {
        var cardView = false;

        if ($(window).width() < 640) {
            cardView = true;
        }

        $('#table, #column, #event, #method, #localization').bootstrapTable('destroy');

        $('#table').bootstrapTable({
            cardView: cardView,
            columns: [
                {field: 'name', title: 'Name', align: 'center', width: 60, sortable: true},
                {field: 'type', title: 'Type', align: 'center', width: 60},
                {field: 'description', title: 'Description', width: 400},
                {field: 'default', title: 'Default', align: '', width: 180}
            ],
            data: [
                {
                    name: 'bootstrapVersion',
                    type: 'Number',
                    description: 'Bootstrap version.',
                    'default': '3'
                },
                {
                    name: 'classes',
                    type: 'String',
                    description: 'The class name of table.',
                    'default': 'table table-hover'
                },
                {
                    name: 'height',
                    type: 'Number',
                    description: 'The height of table.',
                    'default': 'undefined'
                },
                {
                    name: 'undefinedText',
                    type: 'String',
                    description: 'Defines the default undefined text.',
                    'default': '-'
                },
                {
                    name: 'striped',
                    type: 'Boolean',
                    description: 'True to stripe the rows.',
                    'default': 'false'
                },
                {
                    name: 'sortName',
                    type: 'String',
                    description: 'Defines which column can be sorted.',
                    'default': 'undefined'
                },
                {
                    name: 'sortOrder',
                    type: 'String',
                    description: 'Defines the column sort order, can only be "asc" or "desc".',
                    'default': 'asc'
                },
                {
                    name: 'columns',
                    type: 'Array',
                    description: 'The table columns config object, see column properties for more details.',
                    'default': '[]'
                },
                {
                    name: 'data',
                    type: 'Array',
                    description: 'The data to be loaded.',
                    'default': '[]'
                },
                {
                    name: 'method',
                    type: 'String',
                    description: 'The method type to request remote data.',
                    'default': 'get'
                },
                {
                    name: 'url',
                    type: 'String',
                    description: 'A URL to request data from remote site.',
                    'default': 'undefined'
                },
                {
                    name: 'contentType',
                    type: 'String',
                    description: 'The contentType of request remote data.',
                    'default': 'application/json'
                },
                {
                    name: 'queryParams',
                    type: 'Function',
                    description: 'When request remote data, sending additional parameters by format the queryParams, the parameters object contains: <br>pageSize, pageNumber, searchText, sortName, sortOrder.',
                    'default': 'function(params) {<br>return {};<br>}'
                },
                {
                    name: 'pagination',
                    type: 'Boolean',
                    description: 'True to show a pagination toolbar on datagrid bottom.',
                    'default': 'false'
                },
                {
                    name: 'sidePagination',
                    type: 'String',
                    description: 'Defines the side pagination of table, can only be "client" or "server".',
                    'default': 'client'
                },
                {
                    name: 'totalRows',
                    type: 'Number',
                    description: 'Defines the total rows of table, you need to set this option when the sidePagination option is set to "server".',
                    'default': 0
                },
                {
                    name: 'pageNumber',
                    type: 'Number',
                    description: 'When set pagination property, initialize the page number.',
                    'default': 1
                },
                {
                    name: 'pageSize',
                    type: 'Number',
                    description: 'When set pagination property, initialize the page size.',
                    'default': 10
                },
                {
                    name: 'pageList',
                    type: 'Array',
                    description: 'When set pagination property, initialize the page size selecting list.',
                    'default': '[10, 25, 50, 100]'
                },
                {
                    name: 'search',
                    type: 'Boolean',
                    description: 'Enable the search input.',
                    'default': 'false'
                },
                {
                    name: 'selectItemName',
                    type: 'String',
                    description: 'The name of radio or checkbox input.',
                    'default': 'btSelectItem'
                },
                {
                    name: 'showHeader',
                    type: 'Boolean',
                    description: 'False to hide the table header.',
                    'default': 'true'
                },
                {
                    name: 'showColumns',
                    type: 'Boolean',
                    description: 'True to show the columns drop down list.',
                    'default': 'false'
                },
                {
                    name: 'idField',
                    type: 'String',
                    description: 'Indicate which field is an identity field.',
                    'default': 'undefined'
                },
                {
                    name: 'cardView',
                    type: 'Boolean',
                    description: 'True to show card view table, for example mobile view.',
                    'default': 'false'
                },
                {
                    name: 'clickToSelect',
                    type: 'Boolean',
                    description: 'True to select checkbox or radiobox when click rows.',
                    'default': 'false'
                },
                {
                    name: 'singleSelect',
                    type: 'Boolean',
                    description: 'True to allow checkbox selecting only one row.',
                    'default': 'false'
                },
                {
                    name: 'toolbar',
                    type: 'String',
                    description: 'A jQuery selector that indicate the toolbar, for example: <br>#toolbar, .toolbar.',
                    'default': 'undefined'
                },
                {
                    name: 'rowStyle',
                    type: 'Function',
                    description: 'The row formatter function, take two parameters: <br>row: the row record data.<br>index: the row index.<br>Support classes or css, code example:<br>{<br>classes: "red", <br>css: {background: "red", color: "white"}<br>}',
                    'default': '{}'
                }
            ]
        });
        $('#column').bootstrapTable({
            cardView: cardView,
            columns: [
                {field: 'name', title: 'Name', align: 'center', valign: 'middle', width: 60, sortable: true},
                {field: 'type', title: 'Type', align: 'center', valign: 'middle', width: 60},
                {field: 'description', title: 'Description', width: 400},
                {field: 'default', title: 'Default', align: 'right', valign: 'middle', width: 180}
            ],
            data: [
                {
                    name: 'radio',
                    type: 'Boolean',
                    description: 'True to show a radio. The radio column has fixed width.',
                    'default': 'false'
                },
                {
                    name: 'checkbox',
                    type: 'Boolean',
                    description: 'True to show a checkbox. The checkbox column has fixed width.',
                    'default': 'false'
                },
                {
                    name: 'field',
                    type: 'String',
                    description: 'The column field name.',
                    'default': 'undefined'
                },
                {
                    name: 'title',
                    type: 'String',
                    description: 'The column title text.',
                    'default': 'undefined'
                },
                {
                    name: 'align',
                    type: 'String',
                    description: 'Indicate how to align the column data. "left", "right", "center" can be used.',
                    'default': 'undefined'},
                {
                    name: 'valign',
                    type: 'String',
                    description: 'Indicate how to align the cell data. "top", "middle", "bottom" can be used.',
                    'default': 'undefined'
                },
                {
                    name: 'width',
                    type: 'Number',
                    description: 'The width of column. If not defined, the width will auto expand to fit its contents.',
                    'default': 'undefined'},
                {
                    name: 'sortable',
                    type: 'Boolean',
                    description: 'True to allow the column can be sorted.',
                    'default': 'false'
                },
                {
                    name: 'order',
                    type: 'String',
                    description: 'The default sort order, can only be "asc" or "desc".',
                    'default': 'asc'
                },
                {
                    name: 'visible',
                    type: 'Boolean',
                    description: 'True to visible the columns item.',
                    'default': 'true'
                },
                {
                    name: 'formatter',
                    type: 'Function',
                    description: 'The cell formatter function, take two parameters: <br />value: the field value. <br />row: the row record data.<br />index: the row index.',
                    'default': 'undefined'
                },
                {
                    name: 'sorter',
                    type: 'Function',
                    description: 'The custom field sort function that used to do local sorting, take two parameters: <br />a: the first field value.<br /> b: the second field value.',
                    'default': 'undefined'
                }
            ]
        });
        $('#event').bootstrapTable({
            cardView: cardView,
            columns: [
                {field: 'name', title: 'Option Event', align: 'center', valign: 'middle', width: 100, sortable: true},
                {field: 'event', title: 'jQuery Event', align: 'center', valign: 'middle', width: 100, sortable: true},
                {field: 'parameter', title: 'Parameter', align: 'center', valign: 'middle', width: 100, sortable: true},
                {field: 'description', title: 'Description', width: 400, sortable: true}
            ],
            data: [
                {
                    name: 'onAll',
                    event: 'all.bs.table',
                    parameter: 'name, args',
                    description: 'Fires when all events trigger, the parameters contains: <br />name: the event name, <br>args: the event data.'
                },
                {
                    name: 'onClickRow',
                    event: 'click-row.bs.table',
                    parameter: 'row, $element',
                    description: 'Fires when user click a row, the parameters contains: <br />row: the record corresponding to the clicked row, <br>$element: the tr element.'
                },
                {
                    name: 'onDblClickRow',
                    event: 'dbl-click-row.bs.table',
                    parameter: 'row, $element',
                    description: 'Fires when user click a row, the parameters contains: <br />row: the record corresponding to the clicked row, <br>$element: the tr element.'
                },
                {
                    name: 'onSort',
                    event: 'sort.bs.table',
                    parameter: 'name, order',
                    description: 'Fires when user sort a column, the parameters contains: <br />name: the sort column field name<br />order: the sort column order.'
                },
                {
                    name: 'onCheck',
                    event: 'check.bs.table',
                    parameter: 'row',
                    description: 'Fires when user check a row, the parameters contains: <br />row: the record corresponding to the clicked row.'
                },
                {
                    name: 'onUncheck',
                    event: 'uncheck.bs.table',
                    parameter: 'row',
                    description: 'Fires when user uncheck a row, the parameters contains: <br />row: the record corresponding to the clicked row.'
                },
                {
                    name: 'onCheckAll',
                    event: 'check-all.bs.table',
                    parameter: 'none',
                    description: 'Fires when user check all rows.'
                },
                {
                    name: 'onUncheckAll',
                    event: 'uncheck-all.bs.table',
                    parameter: 'none',
                    description: 'Fires when user uncheck all rows.'
                },
                {
                    name: 'onLoadSuccess',
                    event: 'load-success.bs.table',
                    parameter: 'data',
                    description: 'Fires when remote data is loaded successfully.'
                },
                {
                    name: 'onLoadError',
                    event: 'load-error.bs.table',
                    parameter: 'status',
                    description: 'Fires when some errors occur to load remote data.'
                },
                {
                    name: 'onBeforeLoad',
                    event: 'before-load.bs.table',
                    parameter: 'res',
                    description: 'Fires before a request is made to load data.'
                }
            ],
            onClickRow: function (row) {
                console.log('onClickRow', row);
            },
            onSort: function (name, order) {
                console.log('onSort', name, order);
            },
            onCheck: function(row) {
                console.log('onCheck', row);
            },
            onUncheck: function(row) {
                console.log('onUncheck', row);
            },
            onCheckAll: function() {
                console.log('onCheckAll');
            },
            onUncheckAll: function() {
                console.log('onUncheckAll');
            }
        });
        $('#method').bootstrapTable({
            cardView: cardView,
            columns: [
                {field: 'name', title: 'Name', align: 'center', valign: 'middle', width: 100},
                {field: 'parameter', title: 'Parameter', align: 'center', valign: 'middle', width: 100},
                {field: 'description', title: 'Description', width: 400}
            ]
        }).bootstrapTable('load', [
                {name: 'getSelections', parameter: 'none', description: 'Return all selected rows, when no record selected, am empty array will return.'},
                {name: 'load', parameter: 'data', description: 'Load the data to table.'}
            ]).bootstrapTable('append', [
                {name: 'append', parameter: 'data', description: 'Append the data to table.'},
                {name: 'mergeCells', parameter: 'options', description: 'Merge some cells to one cell, the options contains following properties:'},
                {name: 'mergeCells', parameter: 'options', description: 'index: the row index.'},
                {name: 'mergeCells', parameter: 'options', description: 'field: the field name.'},
                {name: 'mergeCells', parameter: 'options', description: 'rowspan: the rowspan count to be merged.'},
                {name: 'mergeCells', parameter: 'options', description: 'colspan: the colspan count to be merged.'},
                {name: 'refresh', parameter: 'none', description: 'Refresh the remote server data.'},
                {name: 'showLoading', parameter: 'none', description: 'Show loading status.'},
                {name: 'hideLoading', parameter: 'none', description: 'Hide loading status.'},
                {name: 'checkAll', parameter: 'none', description: 'Check all current page rows.'},
                {name: 'uncheckAll', parameter: 'none', description: 'Uncheck all current page rows.'},
                {name: 'resetView', parameter: 'none', description: 'Reset the bootstrap table view, like display error when init the table with display: none.'},
                {name: 'destroy', parameter: 'none', description: 'Destroy the bootstrap table.'}
            ]).bootstrapTable('mergeCells', {
                index: 3,
                field: 'name',
                rowspan: 5
            }).bootstrapTable('mergeCells', {
                index: 3,
                field: 'parameter',
                rowspan: 5
            });

        $('#localization').bootstrapTable({
            cardView: cardView,
            columns: [
                {field: 'name', title: 'Name', align: 'center', valign: 'middle', width: 100},
                {field: 'parameter', title: 'Parameter', align: 'center', valign: 'middle', width: 100},
                {field: 'default', title: 'Default', align: 'center', valign: 'middle', width: 200}
            ],
            data: [{
                name: 'formatLoadingMessage',
                parameter: '-',
                'default': 'Loading, please wait…'
            }, {
                name: 'formatRecordsPerPage',
                parameter: 'pageNumber',
                'default': '%s records per page'
            }, {
                name: 'formatShowingRows',
                parameter: 'pageFrom, pageTo, totalRows',
                'default': 'Showing %s to %s of %s rows'
            }, {
                name: 'formatSearch',
                parameter: '-',
                'default': 'Search'
            }, {
                name: 'formatNoMatches',
                parameter: '-',
                'default': 'No matching records found'
            }]
        });
    }

    var $window = $(window);
    var $body = $(document.body);

    var navHeight = $('.navbar').outerHeight(true) + 10;

    $body.scrollspy({
        target: '.bs-sidebar',
        offset: navHeight
    });

    $window.on('load', function () {
        $body.scrollspy('refresh')
    });

    $window.on('resize', function() {
        initTables();
    });

    // affix
    setTimeout(function () {
        var $sideBar = $('.bs-sidebar');

        $sideBar.affix({
            offset: {
                top: function () {
                    var offsetTop = $sideBar.offset().top;
                    var sideBarMargin = parseInt($sideBar.children(0).css('margin-top'), 10);
                    var navOuterHeight = $('.bs-docs-nav').height();

                    return (this.top = offsetTop - navOuterHeight - sideBarMargin);
                },
                bottom: function () {
                    return (this.bottom = $('.bs-footer').outerHeight(true));
                }
            }
        });
    }, 100);

    initTables();
});