/**
 * Bootstrap Table English translation
 * Author: Zhixin Wen<wenzhixin2010@gmail.com>
 */
(function ($) {
    'use strict';

    $.extend($.fn.bootstrapTable.defaults, {
        formatRecordsPerPage: function(pageNumber) {
            return pageNumber + ' records per page';
        },
        formatShowingRows: function(pageFrom, pageTo, totalRows) {
            return 'Showing ' + pageFrom + ' to ' + pageTo + ' of ' + totalRows + ' rows';
        },
        formatSearch: function() {
            return 'Search'
        }
    });
})(jQuery);