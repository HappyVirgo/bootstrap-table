/**
 * @author: Dennis Hernández
 * @webSite: http://djhvscf.github.io/Blog
 * @version: v1.0.0
 */

!function ($) {

    'use strict';

    $.extend($.fn.bootstrapTable.defaults, {
        reorderable: false,
        maxMovingRows: 10,
        onReorder: function (headerFields) {
            return false;
        }
    });

    $.extend($.fn.bootstrapTable.Constructor.EVENTS, {
        'reorder.bs.table': 'onReorder'
    });

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _initHeader = BootstrapTable.prototype.initHeader,
        _toggleColumn = BootstrapTable.prototype.toggleColumn,
        _toggleView = BootstrapTable.prototype.toggleView,
        _resetView = BootstrapTable.prototype.resetView;

    BootstrapTable.prototype.initHeader = function () {
        _initHeader.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.reorderable) {
            return;
        }

        this.makeColumnsReorderable();
    };

    BootstrapTable.prototype.toggleColumn = function () {
        _toggleColumn.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.reorderable) {
            return;
        }

        this.makeColumnsReorderable();
    };

    BootstrapTable.prototype.toggleView = function () {
        _toggleView.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.reorderable) {
            return;
        }

        if (this.options.cardView) {
            return;
        }

        this.makeColumnsReorderable();
    };

    BootstrapTable.prototype.resetView = function () {
        _resetView.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.reorderable) {
            return;
        }

        this.makeColumnsReorderable();
    };

    BootstrapTable.prototype.makeColumnsReorderable = function () {

        var that = this;
        try {
            $(this.$el).dragtable('destroy');
        } catch (e) {}
        $(this.$el).dragtable({
            maxMovingRows: that.options.maxMovingRows,
            clickDelay:200,
            beforeStop: function() {
                var ths = [];
                that.$header.find('th').each(function (i) {
                    ths.push($(this).data('field'));
                });

                that.header.fields = ths;

                that.resetView();
                that.trigger('reorder', ths);
            }
        });
    };
}(jQuery);