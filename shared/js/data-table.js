/**
 * DataTable — lightweight, config-driven table engine.
 *
 * new DataTable('#container', {
 *   columns: [
 *     { key:'name', label:'Name', sortable:true, searchable:true },
 *     { key:'status', label:'Status', filterable:true,
 *       filterOptions:[{value:'active',label:'Active'},{value:'suspended',label:'Suspended'}],
 *       render:(row)=> `<span class="badge badge-success">${row.status}</span>` },
 *   ],
 *   data: [...],
 *   getRowId: row => row.id,
 *   pageSize: 10,
 *   rowActions: [
 *     { label:'View', icon:'eye', onClick:(row)=>{} },
 *     { label:'Edit', icon:'pencil', onClick:(row)=>{} },
 *     { type:'separator' },
 *     { label:'Delete', icon:'trash-2', danger:true, onClick:(row)=>{} },
 *   ],
 *   bulkActions: [{ label:'Delete selected', icon:'trash-2', danger:true, onClick:(rows)=>{} }],
 *   toolbarActionsHtml: '<button class="btn btn-primary btn-sm">...</button>',
 *   emptyState: { icon:'inbox', title:'No results', description:'Try adjusting filters.' },
 * });
 */
let __dtInstanceCounter = 0;

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

class DataTable {
  constructor(selector, config) {
    this.root = typeof selector === "string" ? document.querySelector(selector) : selector;
    this.id = `dt-${++__dtInstanceCounter}`;
    this.config = Object.assign({
      pageSize: 10,
      pageSizeOptions: [10, 20, 50],
      selectable: true,
      showToolbar: true,
      showSearch: true,
      searchPlaceholder: "Search...",
      getRowId: (row) => row.id,
      rowActions: null,
      bulkActions: [],
      toolbarActionsHtml: "",
      emptyState: { icon: "inbox", title: "No results", description: "Try adjusting your search or filters." },
    }, config);

    this.state = {
      page: 1,
      pageSize: this.config.pageSize,
      search: "",
      filters: {},
      sortKey: this.config.defaultSort?.key || null,
      sortDir: this.config.defaultSort?.dir || "asc",
      selected: new Set(),
      hiddenCols: new Set(),
    };

    this._bindDelegatedEvents();
    this.render();
  }

  setData(data) {
    this.config.data = data;
    this.state.page = 1;
    this.state.selected.clear();
    this.render();
  }

  /* ---------------- data pipeline ---------------- */
  getFiltered() {
    let rows = [...(this.config.data || [])];
    if (this.state.search) {
      const q = this.state.search.toLowerCase();
      const searchableKeys = this.config.columns.filter((c) => c.searchable !== false).map((c) => c.key);
      rows = rows.filter((r) => searchableKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
    }
    Object.entries(this.state.filters).forEach(([key, val]) => {
      if (val === "" || val == null || val === "all") return;
      rows = rows.filter((r) => String(r[key]) === String(val));
    });
    if (this.state.sortKey) {
      const key = this.state.sortKey;
      const dir = this.state.sortDir === "asc" ? 1 : -1;
      rows.sort((a, b) => {
        const av = a[key], bv = b[key];
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
      });
    }
    return rows;
  }

  getVisibleColumns() {
    return this.config.columns.filter((c) => !this.state.hiddenCols.has(c.key));
  }

  /* ---------------- render ---------------- */
  render() {
    // remove any floating panels this instance previously reparented to <body>
    document.querySelectorAll(`[data-dt-owner="${this.id}"]`).forEach((el) => el.remove());

    const filtered = this.getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / this.state.pageSize));
    if (this.state.page > totalPages) this.state.page = totalPages;
    const start = (this.state.page - 1) * this.state.pageSize;
    const paged = filtered.slice(start, start + this.state.pageSize);

    this.root.innerHTML = `
      ${this.config.showToolbar ? this._toolbarHtml() : ""}
      ${this.state.selected.size > 0 && this.config.bulkActions.length ? this._bulkBarHtml() : ""}
      <div class="card overflow-hidden">
        <div class="overflow-x-auto scroll-thin">
          ${paged.length ? this._tableHtml(paged) : this._emptyHtml()}
        </div>
      </div>
      ${this._footerHtml(filtered.length, totalPages)}
    `;

    if (window.lucide) lucide.createIcons();
  }

  _toolbarHtml() {
    const filterCols = this.config.columns.filter((c) => c.filterable);
    return `
    <div class="flex flex-wrap items-center gap-2 mb-3">
      ${this.config.showSearch ? `
      <div class="input-icon-wrap w-full sm:w-64">
        <i class="leading" data-lucide="search"></i>
        <input type="text" class="input" placeholder="${escapeHtml(this.config.searchPlaceholder)}"
          value="${escapeHtml(this.state.search)}" data-dt-search />
      </div>` : ""}
      ${filterCols.map((c) => `
        <select class="select select-sm w-auto" data-dt-filter="${c.key}">
          <option value="all">${escapeHtml(c.filterLabel || `All ${c.label}`)}</option>
          ${c.filterOptions.map((o) => `<option value="${escapeHtml(o.value)}" ${this.state.filters[c.key] === o.value ? "selected" : ""}>${escapeHtml(o.label)}</option>`).join("")}
        </select>
      `).join("")}
      ${this.state.search || Object.values(this.state.filters).some((v) => v && v !== "all") ? `
        <button class="btn btn-ghost btn-sm" data-dt-reset>
          <i data-lucide="x"></i> Reset
        </button>` : ""}
      <div class="ml-auto flex items-center gap-2">
        <button class="btn btn-outline btn-sm" data-dropdown-trigger="${this.id}-cols" data-align="end">
          <i data-lucide="sliders-horizontal"></i> Columns
        </button>
        <div class="overlay-panel dropdown-menu hidden" data-dropdown="${this.id}-cols" data-dt-owner="${this.id}">
          <div class="dropdown-label">Toggle columns</div>
          ${this.config.columns.filter((c) => c.toggleable !== false).map((c) => `
            <label class="dropdown-item" style="cursor:pointer">
              <input type="checkbox" class="checkbox" data-dt-col-toggle="${c.key}" ${this.state.hiddenCols.has(c.key) ? "" : "checked"} />
              <span>${escapeHtml(c.label)}</span>
            </label>
          `).join("")}
        </div>
        ${this.config.toolbarActionsHtml || ""}
      </div>
    </div>`;
  }

  _bulkBarHtml() {
    return `
    <div class="flex items-center justify-between gap-2 mb-3 px-3.5 py-2 rounded-lg border border-border bg-accent/60">
      <p class="text-xs font-medium">${this.state.selected.size} selected</p>
      <div class="flex items-center gap-2">
        ${this.config.bulkActions.map((a, i) => `
          <button class="btn btn-sm ${a.danger ? "btn-outline" : "btn-outline"}" data-dt-bulk="${i}" ${a.danger ? 'style="color:hsl(var(--destructive));border-color:hsl(var(--destructive)/.4)"' : ""}>
            ${a.icon ? `<i data-lucide="${a.icon}"></i>` : ""} ${escapeHtml(a.label)}
          </button>
        `).join("")}
        <button class="btn btn-ghost btn-sm" data-dt-clear-selection>Clear</button>
      </div>
    </div>`;
  }

  _tableHtml(paged) {
    const cols = this.getVisibleColumns();
    const allChecked = paged.length > 0 && paged.every((r) => this.state.selected.has(String(this.config.getRowId(r))));
    return `
    <table class="dtable">
      <thead>
        <tr>
          ${this.config.selectable ? `<th style="width:2.25rem"><input type="checkbox" class="checkbox" data-dt-select-all ${allChecked ? "checked" : ""} /></th>` : ""}
          ${cols.map((c) => `
            <th class="${c.sortable ? "th-sortable" : ""} ${this.state.sortKey === c.key ? "sorted" : ""} ${c.headerClassName || ""}" ${c.sortable ? `data-dt-sort="${c.key}"` : ""}>
              <span class="inline-flex items-center gap-1">
                ${escapeHtml(c.label)}
                ${c.sortable ? `<i class="sortable-icon" data-lucide="${this.state.sortKey === c.key ? (this.state.sortDir === "asc" ? "arrow-up" : "arrow-down") : "chevrons-up-down"}"></i>` : ""}
              </span>
            </th>`).join("")}
          ${this.config.rowActions ? `<th style="width:2.5rem"></th>` : ""}
        </tr>
      </thead>
      <tbody>
        ${paged.map((row) => this._rowHtml(row, cols)).join("")}
      </tbody>
    </table>`;
  }

  _rowHtml(row, cols) {
    const id = String(this.config.getRowId(row));
    const selected = this.state.selected.has(id);
    return `
    <tr class="${selected ? "is-selected" : ""}" data-row-id="${id}">
      ${this.config.selectable ? `<td><input type="checkbox" class="checkbox" data-dt-select-row="${id}" ${selected ? "checked" : ""} /></td>` : ""}
      ${cols.map((c) => `<td class="${c.className || ""}">${c.render ? c.render(row) : escapeHtml(row[c.key])}</td>`).join("")}
      ${this.config.rowActions ? `
        <td class="text-right">
          <button class="btn btn-ghost btn-icon-sm" data-dropdown-trigger="${this.id}-row-${id}" data-align="end">
            <i data-lucide="more-horizontal"></i>
          </button>
          <div class="overlay-panel dropdown-menu hidden" data-dropdown="${this.id}-row-${id}" data-dt-owner="${this.id}">
            ${this.config.rowActions.map((a) => a.type === "separator" ? `<div class="dropdown-sep"></div>` : `
              <button class="dropdown-item ${a.danger ? "danger" : ""}" data-dt-row-action data-row-id="${id}" data-action-label="${escapeHtml(a.label)}">
                ${a.icon ? `<i data-lucide="${a.icon}"></i>` : ""} <span>${escapeHtml(a.label)}</span>
              </button>`).join("")}
          </div>
        </td>` : ""}
    </tr>`;
  }

  _emptyHtml() {
    const e = this.config.emptyState;
    return `<div class="empty-state"><i data-lucide="${e.icon}"></i><h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.description)}</p></div>`;
  }

  _footerHtml(totalRows, totalPages) {
    if (totalRows === 0) return "";
    const start = (this.state.page - 1) * this.state.pageSize + 1;
    const end = Math.min(this.state.page * this.state.pageSize, totalRows);
    return `
    <div class="flex flex-wrap items-center justify-between gap-3 mt-3">
      <p class="text-xs text-muted-foreground">
        ${this.config.selectable && this.state.selected.size > 0 ? `${this.state.selected.size} of ${totalRows} row(s) selected &middot; ` : ""}
        Showing <span class="font-medium text-foreground">${start}-${end}</span> of <span class="font-medium text-foreground">${totalRows}</span>
      </p>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground">Rows per page</span>
          <select class="select select-sm w-auto" data-dt-page-size>
            ${this.config.pageSizeOptions.map((n) => `<option value="${n}" ${this.state.pageSize === n ? "selected" : ""}>${n}</option>`).join("")}
          </select>
        </div>
        <div class="flex items-center gap-1">
          <button class="btn btn-outline btn-icon-sm" data-dt-page="first" ${this.state.page === 1 ? "disabled" : ""}><i data-lucide="chevrons-left"></i></button>
          <button class="btn btn-outline btn-icon-sm" data-dt-page="prev" ${this.state.page === 1 ? "disabled" : ""}><i data-lucide="chevron-left"></i></button>
          <span class="text-xs px-2 whitespace-nowrap">Page ${this.state.page} of ${totalPages}</span>
          <button class="btn btn-outline btn-icon-sm" data-dt-page="next" ${this.state.page === totalPages ? "disabled" : ""}><i data-lucide="chevron-right"></i></button>
          <button class="btn btn-outline btn-icon-sm" data-dt-page="last" ${this.state.page === totalPages ? "disabled" : ""}><i data-lucide="chevrons-right"></i></button>
        </div>
      </div>
    </div>`;
  }

  /* ---------------- events (delegated once on root) ---------------- */
  _bindDelegatedEvents() {
    let searchDebounce;
    this.root.addEventListener("input", (e) => {
      if (e.target.matches("[data-dt-search]")) {
        clearTimeout(searchDebounce);
        const val = e.target.value;
        searchDebounce = setTimeout(() => { this.state.search = val; this.state.page = 1; this.render(); this.root.querySelector("[data-dt-search]")?.focus(); }, 200);
      }
    });

    this.root.addEventListener("change", (e) => {
      if (e.target.matches("[data-dt-filter]")) {
        this.state.filters[e.target.getAttribute("data-dt-filter")] = e.target.value;
        this.state.page = 1;
        this.render();
      }
      if (e.target.matches("[data-dt-page-size]")) {
        this.state.pageSize = Number(e.target.value);
        this.state.page = 1;
        this.render();
      }
      if (e.target.matches("[data-dt-col-toggle]")) {
        const key = e.target.getAttribute("data-dt-col-toggle");
        if (e.target.checked) this.state.hiddenCols.delete(key); else this.state.hiddenCols.add(key);
        this.render();
      }
      if (e.target.matches("[data-dt-select-all]")) {
        const paged = this.getFiltered().slice((this.state.page - 1) * this.state.pageSize, this.state.page * this.state.pageSize);
        if (e.target.checked) paged.forEach((r) => this.state.selected.add(String(this.config.getRowId(r))));
        else paged.forEach((r) => this.state.selected.delete(String(this.config.getRowId(r))));
        this.render();
      }
      if (e.target.matches("[data-dt-select-row]")) {
        const id = e.target.getAttribute("data-dt-select-row");
        if (e.target.checked) this.state.selected.add(id); else this.state.selected.delete(id);
        this.render();
      }
    });

    this.root.addEventListener("click", (e) => {
      const sortTh = e.target.closest("[data-dt-sort]");
      if (sortTh) {
        const key = sortTh.getAttribute("data-dt-sort");
        if (this.state.sortKey === key) this.state.sortDir = this.state.sortDir === "asc" ? "desc" : "asc";
        else { this.state.sortKey = key; this.state.sortDir = "asc"; }
        this.render();
        return;
      }
      if (e.target.closest("[data-dt-reset]")) {
        this.state.search = ""; this.state.filters = {}; this.state.page = 1;
        this.render();
        return;
      }
      const pageBtn = e.target.closest("[data-dt-page]");
      if (pageBtn) {
        const totalPages = Math.max(1, Math.ceil(this.getFiltered().length / this.state.pageSize));
        const cmd = pageBtn.getAttribute("data-dt-page");
        if (cmd === "first") this.state.page = 1;
        else if (cmd === "prev") this.state.page = Math.max(1, this.state.page - 1);
        else if (cmd === "next") this.state.page = Math.min(totalPages, this.state.page + 1);
        else if (cmd === "last") this.state.page = totalPages;
        this.render();
        return;
      }
      if (e.target.closest("[data-dt-clear-selection]")) {
        this.state.selected.clear();
        this.render();
        return;
      }
      const bulkBtn = e.target.closest("[data-dt-bulk]");
      if (bulkBtn) {
        const action = this.config.bulkActions[Number(bulkBtn.getAttribute("data-dt-bulk"))];
        const rows = this.config.data.filter((r) => this.state.selected.has(String(this.config.getRowId(r))));
        action.onClick?.(rows);
        return;
      }
      const rowActionBtn = e.target.closest("[data-dt-row-action]");
      if (rowActionBtn) {
        const id = rowActionBtn.getAttribute("data-row-id");
        const label = rowActionBtn.getAttribute("data-action-label");
        const row = this.config.data.find((r) => String(this.config.getRowId(r)) === id);
        const action = this.config.rowActions.find((a) => a.label === label);
        action?.onClick?.(row);
        return;
      }
    });
  }
}