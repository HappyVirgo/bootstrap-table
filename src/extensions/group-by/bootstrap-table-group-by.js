/**
 * @author: Dennis Hernández
 * @webSite: http://djhvscf.github.io/Blog
 * @version: v1.0.0
 */

!function ($) {

    'use strict';

    var originalRowAttr,
        dataTTId ="data-tt-id",
        dataTTParentId = "data-tt-parent-id",
        obj = {},
        parentId = undefined;

    var rowAttr = function (row, index) {
        //Call the User Defined Function
        originalRowAttr.apply([row, index]);

        obj[dataTTId.toString()] = index;

        if (!row.IsParent) {
            obj[dataTTParentId.toString()] = parentId === undefined ? index : parentId;
        } else {
            parentId = index;
            delete obj[dataTTParentId.toString()];
        }

        return obj;
    };

    var setObjectKeys = function () {
        // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
       Object.keys = function (o) {
           if (o !== Object(o)) {
               throw new TypeError('Object.keys called on a non-object');
           }
           var k = [],
               p;
           for (p in o) {
               if (Object.prototype.hasOwnProperty.call(o, p)) {
                   k.push(p);
               }
           }
           return k;
       }
    };

    var groupBy = function (array , f) {
       var groups = {};
       array.forEach(function(o) {
           var group = JSON.stringify(f(o));
           groups[group] = groups[group] || [];
           groups[group].push(o);
       });
       return Object.keys(groups).map(function (group) {
            return groups[group];
       });
    };

    var makeGrouped = function (that) {
        var newRow = {},
            newData = [];

        var result = groupBy(that.options.data, function (item) {
            return [item[that.options.groupByField]];
        });

        for (var i = 0; i < result.length; i++) {
            newRow[that.options.groupByField.toString()] = result[i][0][that.options.groupByField];
            newRow.IsParent = true;
            result[i].unshift(newRow);
            newRow = {};
        }

        newData = newData.concat.apply(newData, result);

        if (!that.options.loaded) {
            that.options.loaded = true;
            that.options.originalData = that.options.data;
            that.options.data = newData;
        }
    };

    var calculateObjectValue = function (self, name, args, defaultValue) {
        var func = name;

        if (typeof name === 'string') {
            // support obj.func1.func2
            var names = name.split('.');

            if (names.length > 1) {
                func = window;
                $.each(names, function (i, f) {
                    func = func[f];
                });
            } else {
                func = window[name];
            }
        }
        if (typeof func === 'object') {
            return func;
        }
        if (typeof func === 'function') {
            return func.apply(self, args);
        }
        if (!func && typeof name === 'string' && sprintf.apply(this, [name].concat(args))) {
            return sprintf.apply(this, [name].concat(args));
        }
        return defaultValue;
    };

    $.extend($.fn.bootstrapTable.defaults, {
        groupBy: false,
        groupByField: '',
        //internal variables
        loaded: false,
        originalData: undefined
    });

    $.extend($.fn.bootstrapTable.methods, [
        'collapseAll',
        'expandAll'
    ]);

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _init = BootstrapTable.prototype.init,
        _initData = BootstrapTable.prototype.initData;

    BootstrapTable.prototype.init = function () {
        //Temporal validation
        if (!this.options.sortName) {
            if ((this.options.groupBy) && (this.options.groupByField !== '')) {
                var that = this;

                // Compatibility: IE < 9 and old browsers
                if (!Object.keys) {
                    setObjectKeys();
                }

                //Make sure that the internal variables are set correctly
                this.options.loaded = false;
                this.options.originalData = undefined;

                originalRowAttr = this.options.rowAttributes;
                this.options.rowAttributes = rowAttr;
                this.$el.on('post-body.bs.table', function () {
                    that.$el.treetable({
                        expandable: true,
                        onNodeExpand: function () {
                            if (that.options.height) {
                                that.resetHeader();
                            }
                        },
                        onNodeCollapse: function () {
                            if (that.options.height) {
                                that.resetHeader();
                            }
                        }
                    }, true);
                });
            }
        }
        _init.apply(this, Array.prototype.slice.apply(arguments));
    };

    BootstrapTable.prototype.initData = function () {
        //Temporal validation
        if (!this.options.sortName) {
            if ((this.options.groupBy) && (this.options.groupByField !== '')) {
                makeGrouped(this);
            }
        }
        _initData.apply(this, Array.prototype.slice.apply(arguments));
    };

    BootstrapTable.prototype.expandAll = function () {
        this.$el.treetable("expandAll");
    };

    BootstrapTable.prototype.collapseAll = function () {
        this.$el.treetable("collapseAll");
    };
}(jQuery);