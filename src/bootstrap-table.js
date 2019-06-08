/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * version: 1.14.2
 * https://github.com/wenzhixin/bootstrap-table/
 */

import Constants from './constants/index.js'
import Utils from './utils/index.js'
import VirtualScroll from './virtual-scroll/index.js'

class BootstrapTable {
  constructor (el, options) {
    this.options = options
    this.$el = $(el)
    this.$el_ = this.$el.clone()
    this.timeoutId_ = 0
    this.timeoutFooter_ = 0

    this.init()
  }

  init () {
    this.initConstants()
    this.initLocale()
    this.initContainer()
    this.initTable()
    this.initHeader()
    this.initData()
    this.initHiddenRows()
    this.initToolbar()
    this.initPagination()
    this.initBody()
    this.initSearchText()
    this.initServer()
  }

  initConstants () {
    const o = this.options
    this.constants = Constants.CONSTANTS
    this.constants.theme = $.fn.bootstrapTable.theme

    const buttonsPrefix = o.buttonsPrefix ? `${o.buttonsPrefix}-` : ''
    this.constants.buttonsClass = [
      o.buttonsPrefix,
      buttonsPrefix + o.buttonsClass,
      Utils.sprintf(`${buttonsPrefix}%s`, o.iconSize)
    ].join(' ').trim()
  }

  initLocale () {
    if (this.options.locale) {
      const locales = $.fn.bootstrapTable.locales
      const parts = this.options.locale.split(/-|_/)

      parts[0] = parts[0].toLowerCase()
      if (parts[1]) {
        parts[1] = parts[1].toUpperCase()
      }

      if (locales[this.options.locale]) {
        $.extend(this.options, locales[this.options.locale])
      } else if (locales[parts.join('-')]) {
        $.extend(this.options, locales[parts.join('-')])
      } else if (locales[parts[0]]) {
        $.extend(this.options, locales[parts[0]])
      }
    }
  }

  initContainer () {
    const topPagination = ['top', 'both'].includes(this.options.paginationVAlign)
      ? '<div class="fixed-table-pagination clearfix"></div>' : ''
    const bottomPagination = ['bottom', 'both'].includes(this.options.paginationVAlign)
      ? '<div class="fixed-table-pagination"></div>' : ''

    this.$container = $(`
      <div class="bootstrap-table ${this.constants.theme}">
      <div class="fixed-table-toolbar"></div>
      ${topPagination}
      <div class="fixed-table-container">
      <div class="fixed-table-header"><table></table></div>
      <div class="fixed-table-body">
      <div class="fixed-table-loading">
      <span class="loading-wrap">
      <span class="loading-text">${this.options.formatLoadingMessage()}</span>
      <span class="animation-wrap"><span class="animation-dot"></span></span>
      </span>
      </div>
      </div>
      <div class="fixed-table-footer"><table><thead><tr></tr></thead></table></div>
      </div>
      ${bottomPagination}
      </div>
    `)

    this.$container.insertAfter(this.$el)
    this.$tableContainer = this.$container.find('.fixed-table-container')
    this.$tableHeader = this.$container.find('.fixed-table-header')
    this.$tableBody = this.$container.find('.fixed-table-body')
    this.$tableLoading = this.$container.find('.fixed-table-loading')
    this.$tableFooter = this.$el.find('tfoot')
    // checking if custom table-toolbar exists or not
    if (this.options.buttonsToolbar) {
      this.$toolbar = $('body').find(this.options.buttonsToolbar)
    } else {
      this.$toolbar = this.$container.find('.fixed-table-toolbar')
    }
    this.$pagination = this.$container.find('.fixed-table-pagination')

    this.$tableBody.append(this.$el)
    this.$container.after('<div class="clearfix"></div>')

    this.$el.addClass(this.options.classes)
    this.$tableLoading.addClass(this.options.classes)

    if (this.options.height) {
      this.$tableContainer.addClass('fixed-height')

      if (this.options.showFooter) {
        this.$tableContainer.addClass('has-footer')
      }

      if (this.options.classes.split(' ').includes('table-bordered')) {
        this.$tableBody.append('<div class="fixed-table-border"></div>')
        this.$tableBorder = this.$tableBody.find('.fixed-table-border')
        this.$tableLoading.addClass('fixed-table-border')
      }

      this.$tableFooter = this.$container.find('.fixed-table-footer')
    }
  }

  initTable () {
    const columns = []
    const data = []

    this.$header = this.$el.find('>thead')
    if (!this.$header.length) {
      this.$header = $(`<thead class="${this.options.theadClasses}"></thead>`).appendTo(this.$el)
    } else if (this.options.theadClasses) {
      this.$header.addClass(this.options.theadClasses)
    }
    this.$header.find('tr').each((i, el) => {
      const column = []

      $(el).find('th').each((i, el) => {
        // #2014: getFieldIndex and elsewhere assume this is string, causes issues if not
        if (typeof $(el).data('field') !== 'undefined') {
          $(el).data('field', `${$(el).data('field')}`)
        }
        column.push($.extend({}, {
          title: $(el).html(),
          'class': $(el).attr('class'),
          titleTooltip: $(el).attr('title'),
          rowspan: $(el).attr('rowspan') ? +$(el).attr('rowspan') : undefined,
          colspan: $(el).attr('colspan') ? +$(el).attr('colspan') : undefined
        }, $(el).data()))
      })
      columns.push(column)
    })

    if (!Array.isArray(this.options.columns[0])) {
      this.options.columns = [this.options.columns]
    }

    this.options.columns = $.extend(true, [], columns, this.options.columns)
    this.columns = []
    this.fieldsColumnsIndex = []

    Utils.setFieldIndex(this.options.columns)

    this.options.columns.forEach((columns, i) => {
      columns.forEach((_column, j) => {
        const column = $.extend({}, BootstrapTable.COLUMN_DEFAULTS, _column)

        if (typeof column.fieldIndex !== 'undefined') {
          this.columns[column.fieldIndex] = column
          this.fieldsColumnsIndex[column.field] = column.fieldIndex
        }

        this.options.columns[i][j] = column
      })
    })

    // if options.data is setting, do not process tbody and tfoot data
    if (!this.options.data.length) {
      this.options.data = Utils.trToData(this.columns, this.$el.find('>tbody>tr'))
      if (data.length) {
        this.fromHtml = true
      }
    }

    this.footerData = Utils.trToData(this.columns, this.$el.find('>tfoot>tr'))
    if (this.footerData) {
      this.$el.find('tfoot').html('<tr></tr>')
    }

    if (!this.options.showFooter || this.options.cardView) {
      this.$tableFooter.hide()
    } else {
      this.$tableFooter.show()
    }
  }

  initHeader () {
    const visibleColumns = {}
    const html = []

    this.header = {
      fields: [],
      styles: [],
      classes: [],
      formatters: [],
      detailFormatters: [],
      events: [],
      sorters: [],
      sortNames: [],
      cellStyles: [],
      searchables: []
    }

    this.options.columns.forEach((columns, i) => {
      html.push('<tr>')

      if (i === 0 && !this.options.cardView && this.options.detailView && this.options.detailViewIcon) {
        html.push(`<th class="detail" rowspan="${this.options.columns.length}">
          <div class="fht-cell"></div>
          </th>
        `)
      }

      columns.forEach((column, j) => {
        const class_ = Utils.sprintf(' class="%s"', column['class'])
        const unitWidth = column.widthUnit
        const width = Number.parseFloat(column.width)

        const halign = Utils.sprintf('text-align: %s; ', column.halign ? column.halign : column.align)
        const align = Utils.sprintf('text-align: %s; ', column.align)
        let style = Utils.sprintf('vertical-align: %s; ', column.valign)
        style += Utils.sprintf('width: %s; ', (column.checkbox || column.radio) && !width
          ? (!column.showSelectTitle ? '36px' : undefined)
          : (width ? width + unitWidth : undefined))

        if (typeof column.fieldIndex !== 'undefined') {
          this.header.fields[column.fieldIndex] = column.field
          this.header.styles[column.fieldIndex] = align + style
          this.header.classes[column.fieldIndex] = class_
          this.header.formatters[column.fieldIndex] = column.formatter
          this.header.detailFormatters[column.fieldIndex] = column.detailFormatter
          this.header.events[column.fieldIndex] = column.events
          this.header.sorters[column.fieldIndex] = column.sorter
          this.header.sortNames[column.fieldIndex] = column.sortName
          this.header.cellStyles[column.fieldIndex] = column.cellStyle
          this.header.searchables[column.fieldIndex] = column.searchable

          if (!column.visible) {
            return
          }

          if (this.options.cardView && (!column.cardVisible)) {
            return
          }

          visibleColumns[column.field] = column
        }

        html.push(`<th${Utils.sprintf(' title="%s"', column.titleTooltip)}`,
          column.checkbox || column.radio
            ? Utils.sprintf(' class="bs-checkbox %s"', column['class'] || '')
            : class_,
          Utils.sprintf(' style="%s"', halign + style),
          Utils.sprintf(' rowspan="%s"', column.rowspan),
          Utils.sprintf(' colspan="%s"', column.colspan),
          Utils.sprintf(' data-field="%s"', column.field),
          // If `column` is not the first element of `this.options.columns[0]`, then className 'data-not-first-th' should be added.
          j === 0 && i > 0 ? ' data-not-first-th' : '',
          '>')

        html.push(Utils.sprintf('<div class="th-inner %s">', this.options.sortable && column.sortable
          ? 'sortable both' : ''))

        let text = this.options.escape ? Utils.escapeHTML(column.title) : column.title

        const title = text
        if (column.checkbox) {
          text = ''
          if (!this.options.singleSelect && this.options.checkboxHeader) {
            text = '<label><input name="btSelectAll" type="checkbox" /><span></span></label>'
          }
          this.header.stateField = column.field
        }
        if (column.radio) {
          text = ''
          this.header.stateField = column.field
          this.options.singleSelect = true
        }
        if (!text && column.showSelectTitle) {
          text += title
        }

        html.push(text)
        html.push('</div>')
        html.push('<div class="fht-cell"></div>')
        html.push('</div>')
        html.push('</th>')
      })
      html.push('</tr>')
    })

    this.$header.html(html.join(''))
    this.$header.find('th[data-field]').each((i, el) => {
      $(el).data(visibleColumns[$(el).data('field')])
    })
    this.$container.off('click', '.th-inner').on('click', '.th-inner', e => {
      const $this = $(e.currentTarget)

      if (this.options.detailView && !$this.parent().hasClass('bs-checkbox')) {
        if ($this.closest('.bootstrap-table')[0] !== this.$container[0]) {
          return false
        }
      }

      if (this.options.sortable && $this.parent().data().sortable) {
        this.onSort(e)
      }
    })

    this.$header.children().children().off('keypress').on('keypress', e => {
      if (this.options.sortable && $(e.currentTarget).data().sortable) {
        const code = e.keyCode || e.which
        if (code === 13) { // Enter keycode
          this.onSort(e)
        }
      }
    })

    const resizeEvent = `resize.bootstrap-table${this.$el.attr('id') || ''}`
    $(window).off(resizeEvent)
    if (!this.options.showHeader || this.options.cardView) {
      this.$header.hide()
      this.$tableHeader.hide()
      this.$tableLoading.css('top', 0)
    } else {
      this.$header.show()
      this.$tableHeader.show()
      this.$tableLoading.css('top', this.$header.outerHeight() + 1)
      // Assign the correct sortable arrow
      this.getCaret()
      $(window).on(resizeEvent, e => this.resetWidth(e))
    }

    this.$selectAll = this.$header.find('[name="btSelectAll"]')
    this.$selectAll.off('click').on('click', ({currentTarget}) => {
      const checked = $(currentTarget).prop('checked')
      this[checked ? 'checkAll' : 'uncheckAll']()
      this.updateSelected()
    })
  }

  initData (data, type) {
    if (type === 'append') {
      this.options.data = this.options.data.concat(data)
    } else if (type === 'prepend') {
      this.options.data = [].concat(data).concat(this.options.data)
    } else {
      this.options.data = data || this.options.data
    }

    this.data = this.options.data

    if (this.options.sidePagination === 'server') {
      return
    }
    this.initSort()
  }

  initSort () {
    let name = this.options.sortName
    const order = this.options.sortOrder === 'desc' ? -1 : 1
    const index = this.header.fields.indexOf(this.options.sortName)
    let timeoutId = 0

    if (index !== -1) {
      if (this.options.sortStable) {
        this.data.forEach((row, i) => {
          if (!row.hasOwnProperty('_position')) {
            row._position = i
          }
        })
      }

      if (this.options.customSort) {
        Utils.calculateObjectValue(this.options, this.options.customSort, [
          this.options.sortName,
          this.options.sortOrder,
          this.data
        ])
      } else {
        this.data.sort((a, b) => {
          if (this.header.sortNames[index]) {
            name = this.header.sortNames[index]
          }
          const aa = Utils.getItemField(a, name, this.options.escape)
          const bb = Utils.getItemField(b, name, this.options.escape)
          const value = Utils.calculateObjectValue(this.header, this.header.sorters[index], [aa, bb, a, b])

          if (value !== undefined) {
            if (this.options.sortStable && value === 0) {
              return order * (a._position - b._position)
            }
            return order * value
          }

          return Utils.sort(aa, bb, order, this.options.sortStable)
        })
      }

      if (this.options.sortClass !== undefined) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          this.$el.removeClass(this.options.sortClass)
          const index = this.$header.find(`[data-field="${this.options.sortName}"]`).index()
          this.$el.find(`tr td:nth-child(${index + 1})`).addClass(this.options.sortClass)
        }, 250)
      }
    }
  }

  onSort ({type, currentTarget}) {
    const $this = type === 'keypress' ? $(currentTarget) : $(currentTarget).parent()
    const $this_ = this.$header.find('th').eq($this.index())

    this.$header.add(this.$header_).find('span.order').remove()

    if (this.options.sortName === $this.data('field')) {
      this.options.sortOrder = this.options.sortOrder === 'asc' ? 'desc' : 'asc'
    } else {
      this.options.sortName = $this.data('field')
      if (this.options.rememberOrder) {
        this.options.sortOrder = $this.data('order') === 'asc' ? 'desc' : 'asc'
      } else {
        this.options.sortOrder = this.columns[this.fieldsColumnsIndex[$this.data('field')]].sortOrder ||
          this.columns[this.fieldsColumnsIndex[$this.data('field')]].order
      }
    }
    this.trigger('sort', this.options.sortName, this.options.sortOrder)

    $this.add($this_).data('order', this.options.sortOrder)

    // Assign the correct sortable arrow
    this.getCaret()

    if (this.options.sidePagination === 'server') {
      this.initServer(this.options.silentSort)
      return
    }

    this.initSort()
    this.initBody()
  }

  initToolbar () {
    const o = this.options
    let html = []
    let timeoutId = 0
    let $keepOpen
    let $search
    let switchableCount = 0

    if (this.$toolbar.find('.bs-bars').children().length) {
      $('body').append($(o.toolbar))
    }
    this.$toolbar.html('')

    if (typeof o.toolbar === 'string' || typeof o.toolbar === 'object') {
      $(Utils.sprintf('<div class="bs-bars %s-%s"></div>', this.constants.classes.pull, o.toolbarAlign))
        .appendTo(this.$toolbar)
        .append($(o.toolbar))
    }

    // showColumns, showToggle, showRefresh
    html = [`<div class="${[
      'columns',
      `columns-${o.buttonsAlign}`,
      this.constants.classes.buttonsGroup,
      `${this.constants.classes.pull}-${o.buttonsAlign}`
    ].join(' ')}">`]

    if (typeof o.icons === 'string') {
      o.icons = Utils.calculateObjectValue(null, o.icons)
    }

    if (o.showPaginationSwitch) {
      html.push(`<button class="${this.constants.buttonsClass}" type="button" name="paginationSwitch"
        aria-label="Pagination Switch" title="${o.formatPaginationSwitch()}">
        ${o.showButtonIcons ? Utils.sprintf(this.constants.html.icon, o.iconsPrefix, o.icons.paginationSwitchDown) : ''}
        ${o.showButtonText ? o.formatPaginationSwitchUp() : ''}
        </button>`)
    }

    if (o.showRefresh) {
      html.push(`<button class="${this.constants.buttonsClass}" type="button" name="refresh"
        aria-label="Refresh" title="${o.formatRefresh()}">
        ${o.showButtonIcons ? Utils.sprintf(this.constants.html.icon, o.iconsPrefix, o.icons.refresh) : ''}
        ${o.showButtonText ? o.formatRefresh() : ''}
        </button>`)
    }

    if (o.showToggle) {
      html.push(`<button class="${this.constants.buttonsClass}" type="button" name="toggle"
        aria-label="Toggle" title="${o.formatToggle()}">
        ${o.showButtonIcons ? Utils.sprintf(this.constants.html.icon, o.iconsPrefix, o.icons.toggleOff) : '' }
        ${o.showButtonText ? o.formatToggleOn() : ''}
        </button>`)
    }

    if (o.showFullscreen) {
      html.push(`<button class="${this.constants.buttonsClass}" type="button" name="fullscreen"
        aria-label="Fullscreen" title="${o.formatFullscreen()}">
        ${o.showButtonIcons ? Utils.sprintf(this.constants.html.icon, o.iconsPrefix, o.icons.fullscreen) : '' }
        ${o.showButtonText ? o.formatFullscreen() : ''}
        </button>`)
    }

    if (o.showColumns) {
      html.push(`<div class="keep-open ${this.constants.classes.buttonsDropdown}" title="${o.formatColumns()}">
        <button class="${this.constants.buttonsClass} dropdown-toggle" type="button" data-toggle="dropdown"
        aria-label="Columns" title="${o.formatColumns()}">
        ${o.showButtonIcons ? Utils.sprintf(this.constants.html.icon, o.iconsPrefix, o.icons.columns) : '' }
        ${o.showButtonText ? o.formatColumns() : ''} 
        ${this.constants.html.dropdownCaret}
        </button>
        ${this.constants.html.toobarDropdow[0]}`)

      this.columns.forEach((column, i) => {
        if (column.radio || column.checkbox) {
          return
        }

        if (o.cardView && !column.cardVisible) {
          return
        }

        const checked = column.visible ? ' checked="checked"' : ''

        if (column.switchable) {
          html.push(Utils.sprintf(this.constants.html.toobarDropdowItem,
            Utils.sprintf('<input type="checkbox" data-field="%s" value="%s"%s> <span>%s</span>',
              column.field, i, checked, column.title)))
          switchableCount++
        }
      })
      html.push(this.constants.html.toobarDropdow[1], '</div>')
    }

    html.push('</div>')

    // Fix #188: this.showToolbar is for extensions
    if (this.showToolbar || html.length > 2) {
      this.$toolbar.append(html.join(''))
    }

    if (o.showPaginationSwitch) {
      this.$toolbar.find('button[name="paginationSwitch"]')
        .off('click').on('click', () => this.togglePagination())
    }

    if (o.showFullscreen) {
      this.$toolbar.find('button[name="fullscreen"]')
        .off('click').on('click', () => this.toggleFullscreen())
    }

    if (o.showRefresh) {
      this.$toolbar.find('button[name="refresh"]')
        .off('click').on('click', () => this.refresh())
    }

    if (o.showToggle) {
      this.$toolbar.find('button[name="toggle"]')
        .off('click').on('click', () => {
          this.toggleView()
        })
    }

    if (o.showColumns) {
      $keepOpen = this.$toolbar.find('.keep-open')

      if (switchableCount <= o.minimumCountColumns) {
        $keepOpen.find('input').prop('disabled', true)
      }

      $keepOpen.find('li, label').off('click').on('click', e => {
        e.stopImmediatePropagation()
      })
      $keepOpen.find('input').off('click').on('click', ({currentTarget}) => {
        const $this = $(currentTarget)

        this._toggleColumn($this.val(), $this.prop('checked'), false)
        this.trigger('column-switch', $this.data('field'), $this.prop('checked'))
      })
    }

    if (o.search) {
      html = []
      const showSearchButton = Utils.sprintf(this.constants.html.searchButton, o.formatSearch(), o.showButtonIcons ? Utils.sprintf(this.constants.html.icon, o.iconsPrefix, o.icons.search) : '', o.showButtonText ? o.formatSearch() : '')
      const showSearchClearButton = Utils.sprintf(this.constants.html.searchClearButton, o.formatClearSearch(), o.showButtonIcons ? Utils.sprintf(this.constants.html.icon, o.iconsPrefix, o.icons.clearSearch) : '', o.showButtonText ? o.formatClearSearch() : '')

      html.push(Utils.sprintf(`
        <div class="${this.constants.classes.pull}-${o.searchAlign} search ${this.constants.classes.inputGroup}">
            %s
        </div>
      `,
      Utils.sprintf(this.constants.html.inputGroup,
        `<input class="${this.constants.classes.input}${Utils.sprintf(' input-%s', o.iconSize)}" type="text" placeholder="${o.formatSearch()}">`,
        (o.showSearchButton ? showSearchButton : '') +
        (o.showSearchClearButton ? showSearchClearButton : ''))
      ))

      this.$toolbar.append(html.join(''))
      const $searchInput = this.$toolbar.find('.search input')
      $search = o.showSearchButton ? this.$toolbar.find('.search button[name=search]') : $searchInput
      const eventTriggers = o.showSearchButton ? 'click' : 'keyup drop blur'
      $search.off(eventTriggers).on(eventTriggers, event => {
        if (o.searchOnEnterKey && event.keyCode !== 13) {
          return
        }

        if ([37, 38, 39, 40].includes(event.keyCode)) {
          return
        }

        clearTimeout(timeoutId) // doesn't matter if it's 0
        timeoutId = setTimeout(() => {
          this.onSearch(o.showSearchButton ? {currentTarget: $searchInput} : event)
        }, o.searchTimeOut)
      })

      if (o.showSearchClearButton) {
        this.$toolbar.find('.search button[name=clearSearch]').click(() => {
          this.resetSearch()
          this.onSearch({currentTarget: this.$toolbar.find('.search input')})
        })
      }

      if (Utils.isIEBrowser()) {
        $search.off('mouseup').on('mouseup', event => {
          clearTimeout(timeoutId) // doesn't matter if it's 0
          timeoutId = setTimeout(() => {
            this.onSearch(event)
          }, o.searchTimeOut)
        })
      }
    }
  }

  onSearch ({currentTarget, firedByInitSearchText} = {}) {
    if (currentTarget !== undefined) {
      const text = $(currentTarget).val().trim()

      if (this.options.trimOnSearch && $(currentTarget).val() !== text) {
        $(currentTarget).val(text)
      }

      this.searchText = text
      this.options.searchText = text
    }

    if (!firedByInitSearchText) {
      this.options.pageNumber = 1
    }
    this.initSearch()
    if (firedByInitSearchText) {
      if (this.options.sidePagination === 'client') {
        this.updatePagination()
      }
    } else {
      this.updatePagination()
    }
    this.trigger('search', this.searchText)
  }

  initSearch () {
    this.filterOptions = this.filterOptions || this.options.filterOptions
    if (this.options.sidePagination !== 'server') {
      if (this.options.customSearch) {
        this.data = Utils.calculateObjectValue(this.options, this.options.customSearch,
          [this.options.data, this.searchText])
        return
      }

      const s = this.searchText && (this.options.escape
        ? Utils.escapeHTML(this.searchText) : this.searchText).toLowerCase()
      const f = Utils.isEmptyObject(this.filterColumns) ? null : this.filterColumns

      // Check filter
      if (typeof this.filterOptions.filterAlgorithm === 'function') {
        this.data = this.options.data.filter((item, i) => this.filterOptions.filterAlgorithm.apply(null, [item, f]))
      } else if (typeof this.filterOptions.filterAlgorithm === 'string') {
        this.data = f ? this.options.data.filter((item, i) => {
          const filterAlgorithm = this.filterOptions.filterAlgorithm
          if (filterAlgorithm === 'and') {
            for (const key in f) {
              if (
                (Array.isArray(f[key]) &&
                  !f[key].includes(item[key])) ||
                (!Array.isArray(f[key]) &&
                  item[key] !== f[key])
              ) {
                return false
              }
            }
          } else if (filterAlgorithm === 'or') {
            let match = false
            for (const key in f) {
              if (
                (Array.isArray(f[key]) &&
                  f[key].includes(item[key])) ||
                (!Array.isArray(f[key]) &&
                  item[key] === f[key])
              ) {
                match = true
              }
            }

            return match
          }

          return true
        }) : this.options.data
      }

      this.data = s ? this.data.filter((item, i) => {
        for (let j = 0; j < this.header.fields.length; j++) {
          if (!this.header.searchables[j]) {
            continue
          }

          const key = Utils.isNumeric(this.header.fields[j]) ? parseInt(this.header.fields[j], 10) : this.header.fields[j]
          const column = this.columns[this.fieldsColumnsIndex[key]]
          let value

          if (typeof key === 'string') {
            value = item
            const props = key.split('.')
            for (let i = 0; i < props.length; i++) {
              if (value[props[i]] !== null) {
                value = value[props[i]]
              }
            }
          } else {
            value = item[key]
          }

          // Fix #142: respect searchFormatter boolean
          if (column && column.searchFormatter) {
            value = Utils.calculateObjectValue(column,
              this.header.formatters[j], [value, item, i, column.field], value)
          }

          if (typeof value === 'string' || typeof value === 'number') {
            if (this.options.strictSearch) {
              if ((`${value}`).toLowerCase() === s) {
                return true
              }
            } else {
              const largerSmallerEqualsRegex = /(?:(<=|=>|=<|>=|>|<)(?:\s+)?(\d+)?|(\d+)?(\s+)?(<=|=>|=<|>=|>|<))/gm
              const matches = largerSmallerEqualsRegex.exec(s)
              let comparisonCheck = false

              if (matches) {
                const operator = matches[1] || `${matches[5]}l`
                const comparisonValue = matches[2] || matches[3]
                const int = parseInt(value, 10)
                const comparisonInt = parseInt(comparisonValue, 10)

                switch (operator) {
                  case '>':
                  case '<l':
                    comparisonCheck = int > comparisonInt
                    break
                  case '<':
                  case '>l':
                    comparisonCheck = int < comparisonInt
                    break
                  case '<=':
                  case '=<':
                  case '>=l':
                  case '=>l':
                    comparisonCheck = int <= comparisonInt
                    break
                  case '>=':
                  case '=>':
                  case '<=l':
                  case '=<l':
                    comparisonCheck = int >= comparisonInt
                    break
                  default:
                    break
                }
              }

              if (comparisonCheck || (`${value}`).toLowerCase().includes(s)) {
                return true
              }
            }
          }
        }
        return false
      }) : this.data
    }
  }

  initPagination () {
    const o = this.options
    if (!o.pagination) {
      this.$pagination.hide()
      return
    }
    this.$pagination.show()

    const html = []
    let $allSelected = false
    let i
    let from
    let to
    let $pageList
    let $pre
    let $next
    let $number
    const data = this.getData({includeHiddenRows: false})
    let pageList = o.pageList

    if (o.sidePagination !== 'server') {
      o.totalRows = data.length
    }

    this.totalPages = 0
    if (o.totalRows) {
      if (o.pageSize === o.formatAllRows()) {
        o.pageSize = o.totalRows
        $allSelected = true
      } else if (o.pageSize === o.totalRows) {
        // Fix #667 Table with pagination,
        // multiple pages and a search this matches to one page throws exception
        const pageLst = typeof o.pageList === 'string'
          ? o.pageList.replace('[', '').replace(']', '')
            .replace(/ /g, '').toLowerCase().split(',') : o.pageList
        if (pageLst.includes(o.formatAllRows().toLowerCase())) {
          $allSelected = true
        }
      }

      this.totalPages = ~~((o.totalRows - 1) / o.pageSize) + 1

      o.totalPages = this.totalPages
    }
    if (this.totalPages > 0 && o.pageNumber > this.totalPages) {
      o.pageNumber = this.totalPages
    }

    this.pageFrom = (o.pageNumber - 1) * o.pageSize + 1
    this.pageTo = o.pageNumber * o.pageSize
    if (this.pageTo > o.totalRows) {
      this.pageTo = o.totalRows
    }

    if (this.options.pagination && this.options.sidePagination !== 'server') {
      this.options.totalNotFiltered = this.options.data.length
    }

    if (!this.options.showExtendedPagination) {
      this.options.totalNotFiltered = undefined
    }

    const paginationInfo = o.onlyInfoPagination ?
      o.formatDetailPagination(o.totalRows) :
      o.formatShowingRows(this.pageFrom, this.pageTo, o.totalRows, o.totalNotFiltered)

    html.push(`<div class="${this.constants.classes.pull}-${o.paginationDetailHAlign} pagination-detail">
      <span class="pagination-info">
      ${paginationInfo}
      </span>`)

    if (!o.onlyInfoPagination) {
      html.push('<span class="page-list">')

      const pageNumber = [
        `<span class="${this.constants.classes.paginationDropdown}">
        <button class="${this.constants.buttonsClass} dropdown-toggle" type="button" data-toggle="dropdown">
        <span class="page-size">
        ${$allSelected ? o.formatAllRows() : o.pageSize}
        </span>
        ${this.constants.html.dropdownCaret}
        </button>
        ${this.constants.html.pageDropdown[0]}`]

      if (typeof o.pageList === 'string') {
        const list = o.pageList.replace('[', '').replace(']', '')
          .replace(/ /g, '').split(',')

        pageList = []
        for (const value of list) {
          pageList.push(
            (value.toLowerCase() === o.formatAllRows().toLowerCase() ||
              ['all', 'unlimited'].includes(value.toLowerCase()))
              ? o.formatAllRows() : +value)
        }
      }

      pageList.forEach((page, i) => {
        if (!o.smartDisplay || i === 0 || pageList[i - 1] < o.totalRows) {
          let active
          if ($allSelected) {
            active = page === o.formatAllRows() ? this.constants.classes.dropdownActive : ''
          } else {
            active = page === o.pageSize ? this.constants.classes.dropdownActive : ''
          }
          pageNumber.push(Utils.sprintf(this.constants.html.pageDropdownItem, active, page))
        }
      })
      pageNumber.push(`${this.constants.html.pageDropdown[1]}</span>`)

      html.push(o.formatRecordsPerPage(pageNumber.join('')))
      html.push('</span></div>')

      html.push(`<div class="${this.constants.classes.pull}-${o.paginationHAlign} pagination">`,
        Utils.sprintf(this.constants.html.pagination[0], Utils.sprintf(' pagination-%s', o.iconSize)),
        Utils.sprintf(this.constants.html.paginationItem, ' page-pre', o.formatSRPaginationPreText(), o.paginationPreText))

      if (this.totalPages < o.paginationSuccessivelySize) {
        from = 1
        to = this.totalPages
      } else {
        from = o.pageNumber - o.paginationPagesBySide
        to = from + (o.paginationPagesBySide * 2)
      }

      if (o.pageNumber < (o.paginationSuccessivelySize - 1)) {
        to = o.paginationSuccessivelySize
      }

      if (o.paginationSuccessivelySize > this.totalPages - from) {
        from = from - (o.paginationSuccessivelySize - (this.totalPages - from)) + 1
      }

      if (from < 1) {
        from = 1
      }

      if (to > this.totalPages) {
        to = this.totalPages
      }

      const middleSize = Math.round(o.paginationPagesBySide / 2)
      const pageItem = (i, classes = '') => Utils.sprintf(this.constants.html.paginationItem,
        classes + (i === o.pageNumber ? ` ${this.constants.classes.paginationActive}` : ''), o.formatSRPaginationPageText(i), i)

      if (from > 1) {
        let max = o.paginationPagesBySide
        if (max >= from) max = from - 1
        for (i = 1; i <= max; i++) {
          html.push(pageItem(i))
        }
        if ((from - 1) === max + 1) {
          i = from - 1
          html.push(pageItem(i))
        } else {
          if ((from - 1) > max) {
            if (
              (from - o.paginationPagesBySide * 2) > o.paginationPagesBySide &&
              o.paginationUseIntermediate
            ) {
              i = Math.round(((from - middleSize) / 2) + middleSize)
              html.push(pageItem(i, ' page-intermediate'))
            } else {
              html.push(Utils.sprintf(this.constants.html.paginationItem,
                ' page-first-separator disabled', '', '...'))
            }
          }
        }
      }

      for (i = from; i <= to; i++) {
        html.push(pageItem(i))
      }

      if (this.totalPages > to) {
        let min = this.totalPages - (o.paginationPagesBySide - 1)
        if (to >= min) min = to + 1
        if ((to + 1) === min - 1) {
          i = to + 1
          html.push(pageItem(i))
        } else {
          if (min > (to + 1)) {
            if (
              (this.totalPages - to) > o.paginationPagesBySide * 2 &&
              o.paginationUseIntermediate
            ) {
              i = Math.round(((this.totalPages - middleSize - to) / 2) + to)
              html.push(pageItem(i, ' page-intermediate'))
            } else {
              html.push(Utils.sprintf(this.constants.html.paginationItem,
                ' page-last-separator disabled', '...'))
            }
          }
        }

        for (i = min; i <= this.totalPages; i++) {
          html.push(pageItem(i))
        }
      }

      html.push(Utils.sprintf(this.constants.html.paginationItem, ' page-next', o.formatSRPaginationNextText(), o.paginationNextText))
      html.push(this.constants.html.pagination[1], '</div>')
    }
    this.$pagination.html(html.join(''))

    const dropupClass = ['bottom', 'both'].includes(o.paginationVAlign) ?
      ` ${this.constants.classes.dropup}` : ''
    this.$pagination.last().find('.page-list > span').addClass(dropupClass)

    if (!o.onlyInfoPagination) {
      $pageList = this.$pagination.find('.page-list a')
      $pre = this.$pagination.find('.page-pre')
      $next = this.$pagination.find('.page-next')
      $number = this.$pagination.find('.page-item').not('.page-next, .page-pre, .page-last-separator, .page-first-separator')

      if (this.totalPages <= 1) {
        this.$pagination.find('div.pagination').hide()
      }

      if (o.smartDisplay) {
        if (pageList.length < 2 || o.totalRows <= pageList[0]) {
          this.$pagination.find('span.page-list').hide()
        }
      }

      // when data is empty, hide the pagination
      this.$pagination[this.getData().length ? 'show' : 'hide']()

      if (!o.paginationLoop) {
        if (o.pageNumber === 1) {
          $pre.addClass('disabled')
        }
        if (o.pageNumber === this.totalPages) {
          $next.addClass('disabled')
        }
      }

      if ($allSelected) {
        o.pageSize = o.formatAllRows()
      }
      // removed the events for last and first, onPageNumber executeds the same logic
      $pageList.off('click').on('click', e => this.onPageListChange(e))
      $pre.off('click').on('click', e => this.onPagePre(e))
      $next.off('click').on('click', e => this.onPageNext(e))
      $number.off('click').on('click', e => this.onPageNumber(e))
    }
  }

  updatePagination (event) {
    // Fix #171: IE disabled button can be clicked bug.
    if (event && $(event.currentTarget).hasClass('disabled')) {
      return
    }

    if (!this.options.maintainMetaData) {
      this.resetRows()
    }

    this.initPagination()
    if (this.options.sidePagination === 'server') {
      this.initServer()
    } else {
      this.initBody()
    }

    this.trigger('page-change', this.options.pageNumber, this.options.pageSize)
  }

  onPageListChange (event) {
    event.preventDefault()
    const $this = $(event.currentTarget)

    $this.parent().addClass(this.constants.classes.dropdownActive)
      .siblings().removeClass(this.constants.classes.dropdownActive)
    this.options.pageSize = $this.text().toUpperCase() === this.options.formatAllRows().toUpperCase()
      ? this.options.formatAllRows() : +$this.text()
    this.$toolbar.find('.page-size').text(this.options.pageSize)

    this.updatePagination(event)
    return false
  }

  onPagePre (event) {
    event.preventDefault()
    if ((this.options.pageNumber - 1) === 0) {
      this.options.pageNumber = this.options.totalPages
    } else {
      this.options.pageNumber--
    }
    this.updatePagination(event)
    return false
  }

  onPageNext (event) {
    event.preventDefault()
    if ((this.options.pageNumber + 1) > this.options.totalPages) {
      this.options.pageNumber = 1
    } else {
      this.options.pageNumber++
    }
    this.updatePagination(event)
    return false
  }

  onPageNumber (event) {
    event.preventDefault()
    if (this.options.pageNumber === +$(event.currentTarget).text()) {
      return
    }
    this.options.pageNumber = +$(event.currentTarget).text()
    this.updatePagination(event)
    return false
  }

  initRow (item, i, data, trFragments) {
    const html = []
    let style = {}
    const csses = []
    let data_ = ''
    let attributes = {}
    const htmlAttributes = []

    if (Utils.findIndex(this.hiddenRows, item) > -1) {
      return
    }

    style = Utils.calculateObjectValue(this.options, this.options.rowStyle, [item, i], style)

    if (style && style.css) {
      for (const [key, value] of Object.entries(style.css)) {
        csses.push(`${key}: ${value}`)
      }
    }

    attributes = Utils.calculateObjectValue(this.options,
      this.options.rowAttributes, [item, i], attributes)

    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        htmlAttributes.push(`${key}="${Utils.escapeHTML(value)}"`)
      }
    }

    if (item._data && !Utils.isEmptyObject(item._data)) {
      for (const [k, v] of Object.entries(item._data)) {
        // ignore data-index
        if (k === 'index') {
          return
        }
        data_ += ` data-${k}='${typeof v === 'object' ? JSON.stringify(v) : v}'`
      }
    }

    html.push('<tr',
      Utils.sprintf(' %s', htmlAttributes.length ? htmlAttributes.join(' ') : undefined),
      Utils.sprintf(' id="%s"', Array.isArray(item) ? undefined : item._id),
      Utils.sprintf(' class="%s"', style.classes || (Array.isArray(item) ? undefined : item._class)),
      ` data-index="${i}"`,
      Utils.sprintf(' data-uniqueid="%s"', Utils.getItemField(item, this.options.uniqueId, false)),
      Utils.sprintf(' data-has-detail-view="%s"', (!this.options.cardView && this.options.detailView && Utils.calculateObjectValue(null, this.options.detailFilter, [i, item])) ? 'true' : undefined),
      Utils.sprintf('%s', data_),
      '>'
    )

    if (this.options.cardView) {
      html.push(`<td colspan="${this.header.fields.length}"><div class="card-views">`)
    }

    if (!this.options.cardView && this.options.detailView && this.options.detailViewIcon) {
      html.push('<td>')

      if (Utils.calculateObjectValue(null, this.options.detailFilter, [i, item])) {
        html.push(`
          <a class="detail-icon" href="#">
          ${Utils.sprintf(this.constants.html.icon, this.options.iconsPrefix, this.options.icons.detailOpen)}
          </a>
        `)
      }

      html.push('</td>')
    }

    this.header.fields.forEach((field, j) => {
      let text = ''
      let value_ = Utils.getItemField(item, field, this.options.escape)
      let value = ''
      let type = ''
      let cellStyle = {}
      let id_ = ''
      let class_ = this.header.classes[j]
      let style_ = ''
      let data_ = ''
      let rowspan_ = ''
      let colspan_ = ''
      let title_ = ''
      const column = this.columns[j]

      if (this.fromHtml && typeof value_ === 'undefined') {
        if ((!column.checkbox) && (!column.radio)) {
          return
        }
      }

      if (!column.visible) {
        return
      }

      if (this.options.cardView && (!column.cardVisible)) {
        return
      }

      if (column.escape) {
        value_ = Utils.escapeHTML(value_)
      }

      if (csses.concat([this.header.styles[j]]).length) {
        style_ = ` style="${csses.concat([this.header.styles[j]]).join('; ')}"`
      }
      // handle td's id and class
      if (item[`_${field}_id`]) {
        id_ = Utils.sprintf(' id="%s"', item[`_${field}_id`])
      }
      if (item[`_${field}_class`]) {
        class_ = Utils.sprintf(' class="%s"', item[`_${field}_class`])
      }
      if (item[`_${field}_rowspan`]) {
        rowspan_ = Utils.sprintf(' rowspan="%s"', item[`_${field}_rowspan`])
      }
      if (item[`_${field}_colspan`]) {
        colspan_ = Utils.sprintf(' colspan="%s"', item[`_${field}_colspan`])
      }
      if (item[`_${field}_title`]) {
        title_ = Utils.sprintf(' title="%s"', item[`_${field}_title`])
      }
      cellStyle = Utils.calculateObjectValue(this.header,
        this.header.cellStyles[j], [value_, item, i, field], cellStyle)
      if (cellStyle.classes) {
        class_ = ` class="${cellStyle.classes}"`
      }
      if (cellStyle.css) {
        const csses_ = []
        for (const [key, value] of Object.entries(cellStyle.css)) {
          csses_.push(`${key}: ${value}`)
        }
        style_ = ` style="${csses_.concat(this.header.styles[j]).join('; ')}"`
      }

      value = Utils.calculateObjectValue(column,
        this.header.formatters[j], [value_, item, i, field], value_)

      if (item[`_${field}_data`] && !Utils.isEmptyObject(item[`_${field}_data`])) {
        for (const [k, v] of Object.entries(item[`_${field}_data`])) {
          // ignore data-index
          if (k === 'index') {
            return
          }
          data_ += ` data-${k}="${v}"`
        }
      }

      if (column.checkbox || column.radio) {
        type = column.checkbox ? 'checkbox' : type
        type = column.radio ? 'radio' : type

        const c = column['class'] || ''
        const isChecked = (value === true || value_ || (value && value.checked)) && value !== false
        const isDisabled = !column.checkboxEnabled || (value && value.disabled)

        text = [
          this.options.cardView
            ? `<div class="card-view ${c}">`
            : `<td class="bs-checkbox ${c}"${class_}${style_}>`,
          `<label>
            <input
            data-index="${i}"
            name="${this.options.selectItemName}"
            type="${type}"
            ${Utils.sprintf('value="%s"', item[this.options.idField])}
            ${Utils.sprintf('checked="%s"', isChecked ? 'checked' : undefined)}
            ${Utils.sprintf('disabled="%s"', isDisabled ? 'disabled' : undefined)} />
            <span></span>
            </label>`,
          this.header.formatters[j] && typeof value === 'string' ? value : '',
          this.options.cardView ? '</div>' : '</td>'
        ].join('')

        item[this.header.stateField] = value === true || (!!value_ || (value && value.checked))
      } else {
        value = typeof value === 'undefined' || value === null
          ? this.options.undefinedText : value

        if (this.options.cardView) {
          const cardTitle = this.options.showHeader
            ? `<span class="card-view-title"${style_}>${Utils.getFieldTitle(this.columns, field)}</span>` : ''

          text = `<div class="card-view">${cardTitle}<span class="card-view-value">${value}</span></div>`

          if (this.options.smartDisplay && value === '') {
            text = '<div class="card-view"></div>'
          }
        } else {
          text = `<td${id_}${class_}${style_}${data_}${rowspan_}${colspan_}${title_}>${value}</td>`
        }
      }

      html.push(text)
    })

    if (this.options.cardView) {
      html.push('</div></td>')
    }
    html.push('</tr>')

    return html.join('')
  }

  initBody (fixedScroll) {
    const data = this.getData()

    this.trigger('pre-body', data)

    this.$body = this.$el.find('>tbody')
    if (!this.$body.length) {
      this.$body = $('<tbody></tbody>').appendTo(this.$el)
    }

    // Fix #389 Bootstrap-table-flatJSON is not working
    if (!this.options.pagination || this.options.sidePagination === 'server') {
      this.pageFrom = 1
      this.pageTo = data.length
    }

    const rows = []
    const trFragments = $(document.createDocumentFragment())
    let hasTr = false

    for (let i = this.pageFrom - 1; i < this.pageTo; i++) {
      const item = data[i]
      const tr = this.initRow(item, i, data, trFragments)
      hasTr = hasTr || !!tr
      if (tr && typeof tr === 'string') {
        if (this.virtualScrollDisabled) {
          trFragments.append(tr)
        } else {
          rows.push(tr)
        }
      }
    }

    // show no records
    if (!hasTr) {
      this.$body.html(`<tr class="no-records-found">${Utils.sprintf('<td colspan="%s">%s</td>',
        this.$header.find('th').length,
        this.options.formatNoMatches())}</tr>`)
    } else {
      if (this.virtualScrollDisabled) {
        this.$body.html(trFragments)
      } else {
        if (this.virtualScroll) {
          this.virtualScroll.destroy()
        }
        this.virtualScroll = new VirtualScroll({
          rows,
          scrollEl: this.$tableBody[0],
          contentEl: this.$body[0],
          callback: () => {
            this.fitHeader()
          }
        })
      }
    }

    if (!fixedScroll) {
      this.scrollTo(0)
    }

    // click to select by column
    this.$body.find('> tr[data-index] > td').off('click dblclick').on('click dblclick', e => {
      const $td = $(e.currentTarget)
      const $tr = $td.parent()
      const $cardViewArr = $(e.target).parents('.card-views').children()
      const $cardViewTarget = $(e.target).parents('.card-view')
      const rowIndex = $tr.data('index')
      const item = this.data[rowIndex]
      const index = this.options.cardView ? $cardViewArr.index($cardViewTarget) : $td[0].cellIndex
      const fields = this.getVisibleFields()
      const field = fields[this.options.detailView && !this.options.cardView ? index - 1 : index]
      const column = this.columns[this.fieldsColumnsIndex[field]]
      const value = Utils.getItemField(item, field, this.options.escape)

      if ($td.find('.detail-icon').length) {
        return
      }

      this.trigger(e.type === 'click' ? 'click-cell' : 'dbl-click-cell', field, value, item, $td)
      this.trigger(e.type === 'click' ? 'click-row' : 'dbl-click-row', item, $tr, field)

      // if click to select - then trigger the checkbox/radio click
      if (
        e.type === 'click' &&
        this.options.clickToSelect &&
        column.clickToSelect &&
        !Utils.calculateObjectValue(this.options, this.options.ignoreClickToSelectOn, [e.target])
      ) {
        const $selectItem = $tr.find(Utils.sprintf('[name="%s"]', this.options.selectItemName))
        if ($selectItem.length) {
          $selectItem[0].click()
        }
      }

      if (e.type === 'click' && this.options.detailViewByClick) {
        this.toggleDetailView(rowIndex, this.header.detailFormatters[index])
      }
    }).off('mousedown').on('mousedown', e => {
      // https://github.com/jquery/jquery/issues/1741
      this.multipleSelectRowCtrlKey = e.ctrlKey || e.metaKey
      this.multipleSelectRowShiftKey = e.shiftKey
    })

    this.$body.find('> tr[data-index] > td > .detail-icon').off('click').on('click', e => {
      e.preventDefault()
      this.toggleDetailView($(e.currentTarget).parent().parent().data('index'))
      return false
    })

    this.$selectItem = this.$body.find(Utils.sprintf('[name="%s"]', this.options.selectItemName))
    this.$selectItem.off('click').on('click', e => {
      e.stopImmediatePropagation()

      const $this = $(e.currentTarget)
      this._toggleCheck($this.prop('checked'), $this.data('index'))
    })

    this.header.events.forEach((_events, i) => {
      let events = _events
      if (!events) {
        return
      }
      // fix bug, if events is defined with namespace
      if (typeof events === 'string') {
        events = Utils.calculateObjectValue(null, events)
      }

      const field = this.header.fields[i]
      let fieldIndex = this.getVisibleFields().indexOf(field)

      if (fieldIndex === -1) {
        return
      }

      if (this.options.detailView && !this.options.cardView) {
        fieldIndex += 1
      }

      for (const [key, event] of Object.entries(events)) {
        this.$body.find('>tr:not(.no-records-found)').each((i, tr) => {
          const $tr = $(tr)
          const $td = $tr.find(this.options.cardView ? '.card-view' : 'td').eq(fieldIndex)
          const index = key.indexOf(' ')
          const name = key.substring(0, index)
          const el = key.substring(index + 1)

          $td.find(el).off(name).on(name, e => {
            const index = $tr.data('index')
            const row = this.data[index]
            const value = row[field]

            event.apply(this, [e, value, row, index])
          })
        })
      }
    })

    this.updateSelected()
    this.initFooter()
    this.resetView()

    if (this.options.sidePagination !== 'server') {
      this.options.totalRows = data.length
    }

    this.trigger('post-body', data)
  }

  initServer (silent, query, url) {
    let data = {}
    const index = this.header.fields.indexOf(this.options.sortName)

    let params = {
      searchText: this.searchText,
      sortName: this.options.sortName,
      sortOrder: this.options.sortOrder
    }

    if (this.header.sortNames[index]) {
      params.sortName = this.header.sortNames[index]
    }

    if (this.options.pagination && this.options.sidePagination === 'server') {
      params.pageSize = this.options.pageSize === this.options.formatAllRows()
        ? this.options.totalRows : this.options.pageSize
      params.pageNumber = this.options.pageNumber
    }

    if (!(url || this.options.url) && !this.options.ajax) {
      return
    }

    if (this.options.queryParamsType === 'limit') {
      params = {
        search: params.searchText,
        sort: params.sortName,
        order: params.sortOrder
      }

      if (this.options.pagination && this.options.sidePagination === 'server') {
        params.offset = this.options.pageSize === this.options.formatAllRows()
          ? 0 : this.options.pageSize * (this.options.pageNumber - 1)
        params.limit = this.options.pageSize === this.options.formatAllRows()
          ? this.options.totalRows : this.options.pageSize
        if (params.limit === 0) {
          delete params.limit
        }
      }
    }

    if (!(Utils.isEmptyObject(this.filterColumnsPartial))) {
      params.filter = JSON.stringify(this.filterColumnsPartial, null)
    }

    data = Utils.calculateObjectValue(this.options, this.options.queryParams, [params], data)

    $.extend(data, query || {})

    // false to stop request
    if (data === false) {
      return
    }

    if (!silent) {
      this.showLoading()
    }
    const request = $.extend({}, Utils.calculateObjectValue(null, this.options.ajaxOptions), {
      type: this.options.method,
      url: url || this.options.url,
      data: this.options.contentType === 'application/json' && this.options.method === 'post'
        ? JSON.stringify(data) : data,
      cache: this.options.cache,
      contentType: this.options.contentType,
      dataType: this.options.dataType,
      success: _res => {
        const res = Utils.calculateObjectValue(this.options,
          this.options.responseHandler, [_res], _res)

        this.load(res)
        this.trigger('load-success', res)
        if (!silent) {
          this.hideLoading()
        }
      },
      error: jqXHR => {
        let data = []
        if (this.options.sidePagination === 'server') {
          data = {}
          data[this.options.totalField] = 0
          data[this.options.dataField] = []
        }
        this.load(data)
        this.trigger('load-error', jqXHR.status, jqXHR)
        if (!silent) this.$tableLoading.hide()
      }
    })

    if (this.options.ajax) {
      Utils.calculateObjectValue(this, this.options.ajax, [request], null)
    } else {
      if (this._xhr && this._xhr.readyState !== 4) {
        this._xhr.abort()
      }
      this._xhr = $.ajax(request)
    }

    return data
  }

  initSearchText () {
    if (this.options.search) {
      this.searchText = ''
      if (this.options.searchText !== '') {
        const $search = this.$toolbar.find('.search input')
        $search.val(this.options.searchText)
        this.onSearch({currentTarget: $search, firedByInitSearchText: true})
      }
    }
  }

  getCaret () {
    this.$header.find('th').each((i, th) => {
      $(th).find('.sortable').removeClass('desc asc')
        .addClass($(th).data('field') === this.options.sortName
          ? this.options.sortOrder : 'both')
    })
  }

  updateSelected () {
    const checkAll = this.$selectItem.filter(':enabled').length &&
      this.$selectItem.filter(':enabled').length ===
      this.$selectItem.filter(':enabled').filter(':checked').length

    this.$selectAll.add(this.$selectAll_).prop('checked', checkAll)

    this.$selectItem.each((i, el) => {
      $(el).closest('tr')[$(el).prop('checked') ? 'addClass' : 'removeClass']('selected')
    })
  }

  updateRows () {
    this.$selectItem.each((i, el) => {
      this.data[$(el).data('index')][this.header.stateField] = $(el).prop('checked')
    })
  }

  resetRows () {
    for (const row of this.data) {
      this.$selectAll.prop('checked', false)
      this.$selectItem.prop('checked', false)
      if (this.header.stateField) {
        row[this.header.stateField] = false
      }
    }
    this.initHiddenRows()
  }

  trigger (_name, ...args) {
    const name = `${_name}.bs.table`
    this.options[BootstrapTable.EVENTS[name]](...args)
    this.$el.trigger($.Event(name), args)

    this.options.onAll(name, args)
    this.$el.trigger($.Event('all.bs.table'), [name, args])
  }

  resetHeader () {
    // fix #61: the hidden table reset header bug.
    // fix bug: get $el.css('width') error sometime (height = 500)
    clearTimeout(this.timeoutId_)
    this.timeoutId_ = setTimeout(() => this.fitHeader(), this.$el.is(':hidden') ? 100 : 0)
  }

  fitHeader () {
    if (this.$el.is(':hidden')) {
      this.timeoutId_ = setTimeout(() => this.fitHeader(), 100)
      return
    }

    const fixedBody = this.$tableBody.get(0)
    const scrollWidth = fixedBody.scrollWidth > fixedBody.clientWidth &&
    fixedBody.scrollHeight > fixedBody.clientHeight + this.$header.outerHeight()
      ? Utils.getScrollBarWidth() : 0

    this.$el.css('margin-top', -this.$header.outerHeight())

    const focused = $(':focus')
    if (focused.length > 0) {
      const $th = focused.parents('th')
      if ($th.length > 0) {
        const dataField = $th.attr('data-field')
        if (dataField !== undefined) {
          const $headerTh = this.$header.find(`[data-field='${dataField}']`)
          if ($headerTh.length > 0) {
            $headerTh.find(':input').addClass('focus-temp')
          }
        }
      }
    }

    this.$header_ = this.$header.clone(true, true)
    this.$selectAll_ = this.$header_.find('[name="btSelectAll"]')
    this.$tableHeader
      .css('margin-right', scrollWidth)
      .find('table').css('width', this.$el.outerWidth())
      .html('').attr('class', this.$el.attr('class'))
      .append(this.$header_)

    this.$tableLoading.css('width', this.$el.outerWidth())

    const focusedTemp = $('.focus-temp:visible:eq(0)')
    if (focusedTemp.length > 0) {
      focusedTemp.focus()
      this.$header.find('.focus-temp').removeClass('focus-temp')
    }

    // fix bug: $.data() is not working as expected after $.append()
    this.$header.find('th[data-field]').each((i, el) => {
      this.$header_.find(Utils.sprintf('th[data-field="%s"]', $(el).data('field'))).data($(el).data())
    })

    const visibleFields = this.getVisibleFields()
    const $ths = this.$header_.find('th')
    let $tr = this.$body.find('>tr:not(.no-records-found,.virtual-scroll-top)').eq(0)

    while ($tr.length && $tr.find('>td[colspan]:not([colspan="1"])').length) {
      $tr = $tr.next()
    }

    $tr.find('> *').each((i, el) => {
      const $this = $(el)
      let index = i

      if (this.options.detailView && this.options.detailViewIcon && !this.options.cardView) {
        if (i === 0) {
          const $thDetail = $ths.filter('.detail')
          const zoomWidth = $thDetail.width() - $thDetail.find('.fht-cell').width()
          $thDetail.find('.fht-cell').width($this.innerWidth() - zoomWidth)
        }
        index = i - 1
      }

      if (index === -1) {
        return
      }

      let $th = this.$header_.find(Utils.sprintf('th[data-field="%s"]', visibleFields[index]))
      if ($th.length > 1) {
        $th = $($ths[$this[0].cellIndex])
      }

      const zoomWidth = $th.width() - $th.find('.fht-cell').width()
      $th.find('.fht-cell').width($this.innerWidth() - zoomWidth)
    })

    this.horizontalScroll()
    this.trigger('post-header')
  }

  initFooter () {
    if (!this.options.showFooter || this.options.cardView) { // do nothing
      return
    }

    const data = this.getData()
    const html = []

    if (!this.options.cardView && this.options.detailView && this.options.detailViewIcon) {
      html.push('<th class="detail"><div class="th-inner"></div><div class="fht-cell"></div></th>')
    }

    for (const column of this.columns) {
      let falign = ''

      let valign = ''
      const csses = []
      let style = {}
      let class_ = Utils.sprintf(' class="%s"', column['class'])

      if (!column.visible) {
        continue
      }

      if (this.options.cardView && (!column.cardVisible)) {
        return
      }

      falign = Utils.sprintf('text-align: %s; ', column.falign ? column.falign : column.align)
      valign = Utils.sprintf('vertical-align: %s; ', column.valign)

      style = Utils.calculateObjectValue(null, this.options.footerStyle, [column])

      if (style && style.css) {
        for (const [key, value] of Object.entries(style.css)) {
          csses.push(`${key}: ${value}`)
        }
      }
      if (style && style.classes) {
        class_ = Utils.sprintf(' class="%s"', column['class'] ?
          [column['class'], style.classes].join(' ') : style.classes)
      }

      html.push('<th', class_, Utils.sprintf(' style="%s"', falign + valign + csses.concat().join('; ')), '>')
      html.push('<div class="th-inner">')

      html.push(Utils.calculateObjectValue(column, column.footerFormatter,
        [data], this.footerData[0] && this.footerData[0][column.field] || ''))

      html.push('</div>')
      html.push('<div class="fht-cell"></div>')
      html.push('</div>')
      html.push('</th>')
    }

    this.$tableFooter.find('tr').html(html.join(''))

    this.trigger('post-footer', this.$tableFooter)
  }

  fitFooter () {
    if (this.$el.is(':hidden')) {
      setTimeout(() => this.fitFooter(), 100)
      return
    }

    const fixedBody = this.$tableBody.get(0)
    const scrollWidth = fixedBody.scrollWidth > fixedBody.clientWidth &&
    fixedBody.scrollHeight > fixedBody.clientHeight + this.$header.outerHeight()
      ? Utils.getScrollBarWidth() : 0

    this.$tableFooter
      .css('margin-right', scrollWidth)
      .find('table').css('width', this.$el.outerWidth())
      .attr('class', this.$el.attr('class'))

    const visibleFields = this.getVisibleFields()
    const $ths = this.$tableFooter.find('th')
    let $tr = this.$body.find('>tr:first-child:not(.no-records-found)')

    while ($tr.length && $tr.find('>td[colspan]:not([colspan="1"])').length) {
      $tr = $tr.next()
    }

    $tr.find('> *').each((i, el) => {
      const $this = $(el)
      let index = i

      if (this.options.detailView && !this.options.cardView) {
        if (i === 0) {
          const $thDetail = $ths.filter('.detail')
          const zoomWidth = $thDetail.width() - $thDetail.find('.fht-cell').width()
          $thDetail.find('.fht-cell').width($this.innerWidth() - zoomWidth)
        }
        index = i - 1
      }

      if (index === -1) {
        return
      }

      const $th = $ths.eq(i)
      const zoomWidth = $th.width() - $th.find('.fht-cell').width()
      $th.find('.fht-cell').width($this.innerWidth() - zoomWidth)
    })

    this.horizontalScroll()
  }

  horizontalScroll () {
    // horizontal scroll event
    // TODO: it's probably better improving the layout than binding to scroll event

    this.trigger('scroll-body')
    this.$tableBody.off('scroll').on('scroll', ({currentTarget}) => {
      if (this.options.showHeader && this.options.height) {
        this.$tableHeader.scrollLeft($(currentTarget).scrollLeft())
      }

      if (this.options.showFooter && !this.options.cardView) {
        this.$tableFooter.scrollLeft($(currentTarget).scrollLeft())
      }
    })
  }

  getVisibleFields () {
    const visibleFields = []

    for (const field of this.header.fields) {
      const column = this.columns[this.fieldsColumnsIndex[field]]

      if (!column.visible) {
        continue
      }
      visibleFields.push(field)
    }
    return visibleFields
  }

  initHiddenRows () {
    this.hiddenRows = []
  }

  // PUBLIC FUNCTION DEFINITION
  // =======================

  getOptions () {
    // deep copy and remove data
    const options = JSON.parse(JSON.stringify(this.options))
    delete options.data
    return options
  }

  refreshOptions (options) {
    // If the objects are equivalent then avoid the call of destroy / init methods
    if (Utils.compareObjects(this.options, options, true)) {
      return
    }
    this.options = $.extend(this.options, options)
    this.trigger('refresh-options', this.options)
    this.destroy()
    this.init()
  }

  getData (params) {
    let data = this.options.data
    if (this.searchText || this.options.sortName || !Utils.isEmptyObject(this.filterColumns) || !Utils.isEmptyObject(this.filterColumnsPartial)) {
      data = this.data
    }

    if (params && params.useCurrentPage) {
      data = data.slice(this.pageFrom - 1, this.pageTo)
    }

    if (params && !params.includeHiddenRows) {
      const hiddenRows = this.getHiddenRows()
      data = data.filter(function (row) {
        return Utils.findIndex(hiddenRows, row) === -1
      })
    }

    return data
  }

  getSelections () {
    // fix #2424: from html with checkbox
    return this.options.data.filter(row =>
      row[this.header.stateField] === true)
  }

  getAllSelections () {
    return this.options.data.filter(row => row[this.header.stateField])
  }

  load (_data) {
    let fixedScroll = false
    let data = _data

    // #431: support pagination
    if (this.options.pagination && this.options.sidePagination === 'server') {
      this.options.totalRows = data[this.options.totalField]
    }

    if (this.options.pagination && this.options.sidePagination === 'server') {
      this.options.totalNotFiltered = data[this.options.totalNotFilteredField]
    }

    fixedScroll = data.fixedScroll
    data = Array.isArray(data) ? data : data[this.options.dataField]

    this.initData(data)
    this.initSearch()
    this.initPagination()
    this.initBody(fixedScroll)
  }

  append (data) {
    this.initData(data, 'append')
    this.initSearch()
    this.initPagination()
    this.initSort()
    this.initBody(true)
  }

  prepend (data) {
    this.initData(data, 'prepend')
    this.initSearch()
    this.initPagination()
    this.initSort()
    this.initBody(true)
  }

  remove (params) {
    const len = this.options.data.length
    let i
    let row

    if (!params.hasOwnProperty('field') || !params.hasOwnProperty('values')) {
      return
    }

    for (i = len - 1; i >= 0; i--) {
      row = this.options.data[i]

      if (!row.hasOwnProperty(params.field)) {
        continue
      }
      if (params.values.includes(row[params.field])) {
        this.options.data.splice(i, 1)
        if (this.options.sidePagination === 'server') {
          this.options.totalRows -= 1
        }
      }
    }

    if (len === this.options.data.length) {
      return
    }

    this.initSearch()
    this.initPagination()
    this.initSort()
    this.initBody(true)
  }

  removeAll () {
    if (this.options.data.length > 0) {
      this.options.data.splice(0, this.options.data.length)
      this.initSearch()
      this.initPagination()
      this.initBody(true)
    }
  }

  insertRow (params) {
    if (!params.hasOwnProperty('index') || !params.hasOwnProperty('row')) {
      return
    }
    this.options.data.splice(params.index, 0, params.row)
    this.initSearch()
    this.initPagination()
    this.initSort()
    this.initBody(true)
  }

  updateRow (params) {
    const allParams = Array.isArray(params) ? params : [params]

    for (const params of allParams) {
      if (!params.hasOwnProperty('index') || !params.hasOwnProperty('row')) {
        continue
      }
      $.extend(this.options.data[params.index], params.row)
    }

    this.initSearch()
    this.initPagination()
    this.initSort()
    this.initBody(true)
  }

  getRowByUniqueId (_id) {
    const uniqueId = this.options.uniqueId
    const len = this.options.data.length
    let id = _id
    let dataRow = null
    let i
    let row
    let rowUniqueId

    for (i = len - 1; i >= 0; i--) {
      row = this.options.data[i]

      if (row.hasOwnProperty(uniqueId)) { // uniqueId is a column
        rowUniqueId = row[uniqueId]
      } else if (row._data && row._data.hasOwnProperty(uniqueId)) { // uniqueId is a row data property
        rowUniqueId = row._data[uniqueId]
      } else {
        continue
      }

      if (typeof rowUniqueId === 'string') {
        id = id.toString()
      } else if (typeof rowUniqueId === 'number') {
        if ((Number(rowUniqueId) === rowUniqueId) && (rowUniqueId % 1 === 0)) {
          id = parseInt(id)
        } else if ((rowUniqueId === Number(rowUniqueId)) && (rowUniqueId !== 0)) {
          id = parseFloat(id)
        }
      }

      if (rowUniqueId === id) {
        dataRow = row
        break
      }
    }

    return dataRow
  }

  updateByUniqueId (params) {
    const allParams = Array.isArray(params) ? params : [params]

    for (const params of allParams) {
      if (!params.hasOwnProperty('id') || !params.hasOwnProperty('row')) {
        continue
      }

      const rowId = this.options.data.indexOf(this.getRowByUniqueId(params.id))

      if (rowId === -1) {
        continue
      }
      $.extend(this.options.data[rowId], params.row)
    }

    this.initSearch()
    this.initPagination()
    this.initSort()
    this.initBody(true)
  }

  removeByUniqueId (id) {
    const len = this.options.data.length
    const row = this.getRowByUniqueId(id)

    if (row) {
      this.options.data.splice(this.options.data.indexOf(row), 1)
    }

    if (len === this.options.data.length) {
      return
    }

    this.initSearch()
    this.initPagination()
    this.initBody(true)
  }

  updateCell (params) {
    if (!params.hasOwnProperty('index') ||
      !params.hasOwnProperty('field') ||
      !params.hasOwnProperty('value')) {
      return
    }
    this.data[params.index][params.field] = params.value

    if (params.reinit === false) {
      return
    }
    this.initSort()
    this.initBody(true)
  }

  updateCellByUniqueId (params) {
    if (!params.hasOwnProperty('id') ||
      !params.hasOwnProperty('field') ||
      !params.hasOwnProperty('value')) {
      return
    }
    const allParams = Array.isArray(params) ? params : [params]

    allParams.forEach(({id, field, value}) => {
      const rowId = this.options.data.indexOf(this.getRowByUniqueId(id))

      if (rowId === -1) {
        return
      }
      this.data[rowId][field] = value
    })

    if (params.reinit === false) {
      return
    }
    this.initSort()
    this.initBody(true)
  }

  showRow (params) {
    this._toggleRow(params, true)
  }

  hideRow (params) {
    this._toggleRow(params, false)
  }

  _toggleRow (params, visible) {
    let row

    if (params.hasOwnProperty('index')) {
      row = this.getData()[params.index]
    } else if (params.hasOwnProperty('uniqueId')) {
      row = this.getRowByUniqueId(params.uniqueId)
    }

    if (!row) {
      return
    }

    const index = Utils.findIndex(this.hiddenRows, row)

    if (!visible && index === -1) {
      this.hiddenRows.push(row)
    } else if (visible && index > -1) {
      this.hiddenRows.splice(index, 1)
    }
    if (visible) {
      this.updatePagination()
    } else {
      this.initBody(true)
      this.initPagination()
    }
  }

  getHiddenRows (show) {
    if (show) {
      this.initHiddenRows()
      this.initBody(true)
      return
    }
    const data = this.getData()
    const rows = []

    for (const row of data) {
      if (this.hiddenRows.includes(row)) {
        rows.push(row)
      }
    }
    this.hiddenRows = rows
    return rows
  }

  showColumn (field) {
    const fields = Array.isArray(field) ? field : [field]
    fields.forEach(field => {
      this._toggleColumn(this.fieldsColumnsIndex[field], true, true)
    })
  }

  hideColumn (field) {
    const fields = Array.isArray(field) ? field : [field]
    fields.forEach(field => {
      this._toggleColumn(this.fieldsColumnsIndex[field], false, true)
    })
  }

  _toggleColumn (index, checked, needUpdate) {
    if (index === -1) {
      return
    }
    this.columns[index].visible = checked
    this.initHeader()
    this.initSearch()
    this.initPagination()
    this.initBody()

    if (this.options.showColumns) {
      const $items = this.$toolbar.find('.keep-open input').prop('disabled', false)

      if (needUpdate) {
        $items.filter(Utils.sprintf('[value="%s"]', index)).prop('checked', checked)
      }

      if ($items.filter(':checked').length <= this.options.minimumCountColumns) {
        $items.filter(':checked').prop('disabled', true)
      }
    }
  }

  getVisibleColumns () {
    return this.columns.filter(({visible}) => visible)
  }

  getHiddenColumns () {
    return this.columns.filter(({visible}) => !visible)
  }

  showAllColumns () {
    this._toggleAllColumns(true)
  }

  hideAllColumns () {
    this._toggleAllColumns(false)
  }

  _toggleAllColumns (visible) {
    for (const column of this.columns) {
      if (column.switchable) {
        column.visible = visible
      }
    }

    this.initHeader()
    this.initSearch()
    this.initPagination()
    this.initBody()
    if (this.options.showColumns) {
      const $items = this.$toolbar.find('.keep-open input').prop('disabled', false)

      if ($items.filter(':checked').length <= this.options.minimumCountColumns) {
        $items.filter(':checked').prop('disabled', true)
      }
    }
  }

  mergeCells (options) {
    const row = options.index
    let col = this.getVisibleFields().indexOf(options.field)
    const rowspan = options.rowspan || 1
    const colspan = options.colspan || 1
    let i
    let j
    const $tr = this.$body.find('>tr')

    if (this.options.detailView && !this.options.cardView) {
      col += 1
    }

    const $td = $tr.eq(row).find('>td').eq(col)

    if (row < 0 || col < 0 || row >= this.data.length) {
      return
    }

    for (i = row; i < row + rowspan; i++) {
      for (j = col; j < col + colspan; j++) {
        $tr.eq(i).find('>td').eq(j).hide()
      }
    }

    $td.attr('rowspan', rowspan).attr('colspan', colspan).show()
  }

  checkAll () {
    this._toggleCheckAll(true)
  }

  uncheckAll () {
    this._toggleCheckAll(false)
  }

  _toggleCheckAll (checked) {
    const rowsBefore = this.getSelections()
    this.$selectAll.add(this.$selectAll_).prop('checked', checked)
    this.$selectItem.filter(':enabled').prop('checked', checked)
    this.updateRows()

    const rowsAfter = this.getSelections()
    if (checked) {
      this.trigger('check-all', rowsAfter, rowsBefore)
      return
    }

    this.trigger('uncheck-all', rowsAfter, rowsBefore)
  }

  checkInvert () {
    const $items = this.$selectItem.filter(':enabled')
    let checked = $items.filter(':checked')
    $items.each((i, el) => {
      $(el).prop('checked', !$(el).prop('checked'))
    })
    this.updateRows()
    this.updateSelected()
    this.trigger('uncheck-some', checked)
    checked = this.getSelections()
    this.trigger('check-some', checked)
  }

  check (index) {
    this._toggleCheck(true, index)
  }

  uncheck (index) {
    this._toggleCheck(false, index)
  }

  _toggleCheck (checked, index) {
    const $el = this.$selectItem.filter(`[data-index="${index}"]`)
    const row = this.data[index]

    if (
      $el.is(':radio') ||
      this.options.singleSelect ||
      this.options.multipleSelectRow &&
      !this.multipleSelectRowCtrlKey &&
      !this.multipleSelectRowShiftKey
    ) {
      for (const r of this.options.data) {
        r[this.header.stateField] = false
      }
      this.$selectItem.filter(':checked').not($el).prop('checked', false)
    }

    row[this.header.stateField] = checked

    if (this.options.multipleSelectRow) {
      if (this.multipleSelectRowShiftKey && this.multipleSelectRowLastSelectedIndex >= 0) {
        const indexes = [this.multipleSelectRowLastSelectedIndex, index].sort()

        for (let i = indexes[0] + 1; i < indexes[1]; i++) {
          this.data[i][this.header.stateField] = true
          this.$selectItem.filter(`[data-index="${i}"]`).prop('checked', true)
        }
      }

      this.multipleSelectRowCtrlKey = false
      this.multipleSelectRowShiftKey = false
      this.multipleSelectRowLastSelectedIndex = checked ? index : -1
    }

    $el.prop('checked', checked)
    this.updateSelected()
    this.trigger(checked ? 'check' : 'uncheck', this.data[index], $el)
  }

  checkBy (obj) {
    this._toggleCheckBy(true, obj)
  }

  uncheckBy (obj) {
    this._toggleCheckBy(false, obj)
  }

  _toggleCheckBy (checked, obj) {
    if (!obj.hasOwnProperty('field') || !obj.hasOwnProperty('values')) {
      return
    }

    const rows = []
    this.options.data.forEach((row, i) => {
      if (!row.hasOwnProperty(obj.field)) {
        return false
      }
      if (obj.values.includes(row[obj.field])) {
        const $el = this.$selectItem.filter(':enabled')
          .filter(Utils.sprintf('[data-index="%s"]', i)).prop('checked', checked)
        row[this.header.stateField] = checked
        rows.push(row)
        this.trigger(checked ? 'check' : 'uncheck', row, $el)
      }
    })
    this.updateSelected()
    this.trigger(checked ? 'check-some' : 'uncheck-some', rows)
  }

  refresh (params) {
    if (params && params.url) {
      this.options.url = params.url
    }
    if (params && params.pageNumber) {
      this.options.pageNumber = params.pageNumber
    }
    if (params && params.pageSize) {
      this.options.pageSize = params.pageSize
    }
    this.trigger('refresh', this.initServer(params && params.silent,
      params && params.query, params && params.url))
  }

  destroy () {
    this.$el.insertBefore(this.$container)
    $(this.options.toolbar).insertBefore(this.$el)
    this.$container.next().remove()
    this.$container.remove()
    this.$el.html(this.$el_.html())
      .css('margin-top', '0')
      .attr('class', this.$el_.attr('class') || '') // reset the class
  }

  resetView (params) {
    let padding = 0

    if (params && params.height) {
      this.options.height = params.height
    }

    this.$selectAll.prop('checked', this.$selectItem.length > 0 &&
      this.$selectItem.length === this.$selectItem.filter(':checked').length)

    this.$tableContainer.toggleClass('has-card-view', this.options.cardView)

    if (!this.options.cardView && this.options.showHeader && this.options.height) {
      this.$tableHeader.show()
      this.resetHeader()
      padding += this.$header.outerHeight(true)
    } else {
      this.$tableHeader.hide()
      this.trigger('post-header')
    }

    if (!this.options.cardView && this.options.showFooter) {
      this.$tableFooter.show()
      this.fitFooter()
      if (this.options.height) {
        padding += this.$tableFooter.outerHeight(true)
      }
    }

    if (this.options.height) {
      const toolbarHeight = this.$toolbar.outerHeight(true)
      const paginationHeight = this.$pagination.outerHeight(true)
      const height = this.options.height - toolbarHeight - paginationHeight
      const tableHeight = this.$tableBody.find('table').outerHeight(true)
      this.$tableContainer.css('height', `${height}px`)
      this.$tableBorder && this.$tableBorder.css('height', `${height - tableHeight - padding - 1}px`)
    }

    if (this.options.cardView) {
      // remove the element css
      this.$el.css('margin-top', '0')
      this.$tableContainer.css('padding-bottom', '0')
      this.$tableFooter.hide()
    } else {
      // Assign the correct sortable arrow
      this.getCaret()
      this.$tableContainer.css('padding-bottom', `${padding}px`)
    }

    this.trigger('reset-view')
  }

  resetWidth () {
    if (this.options.showHeader && this.options.height) {
      this.fitHeader()
    }
    if (this.options.showFooter && !this.options.cardView) {
      this.fitFooter()
    }
  }

  showLoading () {
    this.$tableLoading.css('display', 'flex')
  }

  hideLoading () {
    this.$tableLoading.css('display', 'none')
  }

  togglePagination () {
    this.options.pagination = !this.options.pagination

    const icon = this.options.showButtonIcons ? this.options.pagination ? this.options.icons.paginationSwitchDown : this.options.icons.paginationSwitchUp : ''
    const text = this.options.showButtonText ? this.options.pagination ? this.options.formatPaginationSwitchUp() : this.options.formatPaginationSwitchDown() : ''
    this.$toolbar.find('button[name="paginationSwitch"]')
      .html(Utils.sprintf(this.constants.html.icon, this.options.iconsPrefix, icon) + ' ' + text)
    this.updatePagination()
  }

  toggleFullscreen () {
    this.$el.closest('.bootstrap-table').toggleClass('fullscreen')
    this.resetView()
  }

  toggleView () {
    this.options.cardView = !this.options.cardView
    this.initHeader()

    const icon = this.options.showButtonIcons ? this.options.cardView ? this.options.icons.toggleOn : this.options.icons.toggleOff : ''
    const text = this.options.showButtonText ? this.options.cardView ? this.options.formatToggleOff() : this.options.formatToggleOn() : ''
    this.$toolbar.find('button[name="toggle"]')
      .html(Utils.sprintf(this.constants.html.icon, this.options.iconsPrefix, icon) + ' ' + text)
    this.initBody()
    this.trigger('toggle', this.options.cardView)
  }

  resetSearch (text) {
    const $search = this.$toolbar.find('.search input')
    $search.val(text || '')
    this.onSearch({currentTarget: $search})
  }

  filterBy (columns, options) {
    this.filterOptions = Utils.isEmptyObject(options) ? this.options.filterOptions : $.extend(this.options.filterOptions, options)
    this.filterColumns = Utils.isEmptyObject(columns) ? {} : columns
    this.options.pageNumber = 1
    this.initSearch()
    this.updatePagination()
  }

  scrollTo (params) {
    if (typeof params === 'undefined') {
      return this.$tableBody.scrollTop()
    }

    let options = {unit: 'px', value: 0}
    if (typeof params === 'object') {
      options = Object.assign(options, params)
    } else if (typeof params === 'string' && params === 'bottom') {
      options.value = this.$tableBody[0].scrollHeight
    } else if (typeof params === 'string') {
      options.value = params
    }

    let scrollTo = options.value
    if (options.unit === 'rows') {
      scrollTo = 0
      this.$body.find(`> tr:lt(${options.value})`).each((i, el) => {
        scrollTo += $(el).outerHeight(true)
      })
    }

    this.$tableBody.scrollTop(scrollTo)
  }

  getScrollPosition () {
    return this.scrollTo()
  }

  selectPage (page) {
    if (page > 0 && page <= this.options.totalPages) {
      this.options.pageNumber = page
      this.updatePagination()
    }
  }

  prevPage () {
    if (this.options.pageNumber > 1) {
      this.options.pageNumber--
      this.updatePagination()
    }
  }

  nextPage () {
    if (this.options.pageNumber < this.options.totalPages) {
      this.options.pageNumber++
      this.updatePagination()
    }
  }

  toggleDetailView (index, _columnDetailFormatter) {
    const $tr = this.$body.find(Utils.sprintf('> tr[data-index="%s"]', index))

    if ($tr.next().is('tr.detail-view')) {
      this.collapseRow(index)
    } else {
      this.expandRow(index, _columnDetailFormatter)
    }

    this.resetView()
  }

  expandRow (index, _columnDetailFormatter) {
    const row = this.data[index]
    const $tr = this.$body.find(Utils.sprintf('> tr[data-index="%s"][data-has-detail-view]', index))
    if ($tr.next().is('tr.detail-view')) {
      return
    }

    if (this.options.detailViewIcon) {
      $tr.find('a.detail-icon').html(Utils.sprintf(this.constants.html.icon, this.options.iconsPrefix, this.options.icons.detailClose))
    }

    $tr.after(Utils.sprintf('<tr class="detail-view"><td colspan="%s"></td></tr>', $tr.children('td').length))

    const $element = $tr.next().find('td')

    const detailFormatter = _columnDetailFormatter || this.options.detailFormatter
    const content = Utils.calculateObjectValue(this.options, detailFormatter, [index, row, $element], '')
    if ($element.length === 1) {
      $element.append(content)
    }

    this.trigger('expand-row', index, row, $element)
  }

  collapseRow (index) {
    const row = this.data[index]
    const $tr = this.$body.find(Utils.sprintf('> tr[data-index="%s"][data-has-detail-view]', index))
    if (!$tr.next().is('tr.detail-view')) {
      return
    }

    if (this.options.detailViewIcon) {
      $tr.find('a.detail-icon').html(Utils.sprintf(this.constants.html.icon, this.options.iconsPrefix, this.options.icons.detailOpen))
    }

    this.trigger('collapse-row', index, row, $tr.next())
    $tr.next().remove()
  }

  expandAllRows () {
    const trs = this.$body.find('> tr[data-index][data-has-detail-view]')
    for (let i = 0; i < trs.length; i++) {
      this.expandRow($(trs[i]).data('index'))
    }
  }

  collapseAllRows () {
    const trs = this.$body.find('> tr[data-index][data-has-detail-view]')
    for (let i = 0; i < trs.length; i++) {
      this.collapseRow($(trs[i]).data('index'))
    }
  }

  updateColumnTitle (params) {
    if (!params.hasOwnProperty('field') || !params.hasOwnProperty('title')) {
      return
    }

    this.columns[this.fieldsColumnsIndex[params.field]].title =
      this.options.escape ? Utils.escapeHTML(params.title) : params.title

    if (this.columns[this.fieldsColumnsIndex[params.field]].visible) {
      const header = this.options.height !== undefined ? this.$tableHeader : this.$header
      header.find('th[data-field]').each((i, el) => {
        if ($(el).data('field') === params.field) {
          $($(el).find('.th-inner')[0]).text(params.title)
          return false
        }
      })
    }
  }

  updateFormatText (formatName, text) {
    if (!/^format/.test(formatName) || !this.options[formatName]) {
      return
    }
    if (typeof text === 'string') {
      this.options[formatName] = () => text
    } else if (typeof text === 'function') {
      this.options[formatName] = text
    }
    this.initToolbar()
    this.initPagination()
    this.initBody()
  }
}

BootstrapTable.VERSION = Constants.VERSION
BootstrapTable.DEFAULTS = Constants.DEFAULTS
BootstrapTable.LOCALES = Constants.LOCALES
BootstrapTable.COLUMN_DEFAULTS = Constants.COLUMN_DEFAULTS
BootstrapTable.METHODS = Constants.METHODS
BootstrapTable.EVENTS = Constants.EVENTS

// BOOTSTRAP TABLE PLUGIN DEFINITION
// =======================

$.BootstrapTable = BootstrapTable
$.fn.bootstrapTable = function (option, ...args) {
  let value

  this.each((i, el) => {
    let data = $(el).data('bootstrap.table')
    const options = $.extend({}, BootstrapTable.DEFAULTS, $(el).data(),
      typeof option === 'object' && option)

    if (typeof option === 'string') {
      if (!Constants.METHODS.includes(option)) {
        throw new Error(`Unknown method: ${option}`)
      }

      if (!data) {
        return
      }

      value = data[option](...args)

      if (option === 'destroy') {
        $(el).removeData('bootstrap.table')
      }
    }

    if (!data) {
      $(el).data('bootstrap.table', (data = new $.BootstrapTable(el, options)))
    }
  })

  return typeof value === 'undefined' ? this : value
}

$.fn.bootstrapTable.Constructor = BootstrapTable
$.fn.bootstrapTable.theme = Constants.THEME
$.fn.bootstrapTable.VERSION = Constants.VERSION
$.fn.bootstrapTable.defaults = BootstrapTable.DEFAULTS
$.fn.bootstrapTable.columnDefaults = BootstrapTable.COLUMN_DEFAULTS
$.fn.bootstrapTable.events = BootstrapTable.EVENTS
$.fn.bootstrapTable.locales = BootstrapTable.LOCALES
$.fn.bootstrapTable.methods = BootstrapTable.METHODS
$.fn.bootstrapTable.utils = Utils

// BOOTSTRAP TABLE INIT
// =======================

$(() => {
  $('[data-toggle="table"]').bootstrapTable()
})

export default BootstrapTable
