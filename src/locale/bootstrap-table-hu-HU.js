/**
 * Bootstrap Table Hungarian translation
 * Author: Nagy Gergely <info@nagygergely.eu>
 */

$.fn.bootstrapTable.locales['hu-HU'] = {
  formatLoadingMessage () {
    return 'Betöltés, kérem várjon'
  },
  formatRecordsPerPage (pageNumber) {
    return `${pageNumber} rekord per oldal`
  },
  formatShowingRows (pageFrom, pageTo, totalRows, totalNotFiltered) {
    if (totalNotFiltered !== undefined && totalNotFiltered > 0 && totalNotFiltered > totalRows) {
      return `Megjelenítve ${pageFrom} - ${pageTo} / ${totalRows} összesen (filtered from ${totalNotFiltered} total rows)`
    }

    return `Megjelenítve ${pageFrom} - ${pageTo} / ${totalRows} összesen`
  },
  formatSRPaginationPreText () {
    return 'previous page'
  },
  formatSRPaginationPageText (page) {
    return `to page ${page}`
  },
  formatSRPaginationNextText () {
    return 'next page'
  },
  formatDetailPagination (totalRows) {
    return `Showing ${totalRows} rows`
  },
  formatClearSearch () {
    return 'Clear Search'
  },
  formatSearch () {
    return 'Keresés'
  },
  formatNoMatches () {
    return 'Nincs találat'
  },
  formatPaginationSwitch () {
    return 'Lapozó elrejtése/megjelenítése'
  },
  formatPaginationSwitchDown () {
    return 'Show pagination'
  },
  formatPaginationSwitchUp () {
    return 'Hide pagination'
  },
  formatRefresh () {
    return 'Frissítés'
  },
  formatToggle () {
    return 'Összecsuk/Kinyit'
  },
  formatToggleOn () {
    return 'Show card view'
  },
  formatToggleOff () {
    return 'Hide card view'
  },
  formatColumns () {
    return 'Oszlopok'
  },
  formatFullscreen () {
    return 'Fullscreen'
  },
  formatAllRows () {
    return 'Összes'
  },
  formatAutoRefresh () {
    return 'Auto Refresh'
  },
  formatExport () {
    return 'Export data'
  },
  formatJumpTo () {
    return 'GO'
  },
  formatAdvancedSearch () {
    return 'Advanced search'
  },
  formatAdvancedCloseButton () {
    return 'Close'
  }
}

$.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales['hu-HU'])
