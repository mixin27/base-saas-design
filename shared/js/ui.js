/* =========================================================
   Theme (light / dark)
   ========================================================= */
const Theme = {
  key: "saas-mock-theme",
  init() {
    const saved = localStorage.getItem(this.key);
    const preferred = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    this.apply(preferred);
  },
  apply(mode) {
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem(this.key, mode);
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("data-current", mode);
    });
  },
  toggle() {
    const isDark = document.documentElement.classList.contains("dark");
    this.apply(isDark ? "light" : "dark");
  },
};
Theme.init();

/* =========================================================
   Utility: close every open floating element
   ========================================================= */
function closeAllFloating(except) {
  document.querySelectorAll('[data-open="true"]').forEach((el) => {
    if (el === except) return;
    el.setAttribute("data-open", "false");
    el.classList.add("hidden");
  });
}

function positionFloating(trigger, panel, opts = {}) {
  const r = trigger.getBoundingClientRect();
  const align = opts.align || "start"; // start | end | center
  const side = opts.side || "bottom"; // bottom | top
  panel.style.position = "fixed";
  panel.style.minWidth = opts.matchWidth ? r.width + "px" : "";
  document.body.appendChild(panel); // float above everything, escape overflow:hidden ancestors
  panel.classList.remove("hidden");
  panel.style.visibility = "hidden";
  requestAnimationFrame(() => {
    const pr = panel.getBoundingClientRect();
    let top = side === "bottom" ? r.bottom + 6 : r.top - pr.height - 6;
    let left = align === "end" ? r.right - pr.width : align === "center" ? r.left + r.width / 2 - pr.width / 2 : r.left;
    // keep on-screen
    left = Math.max(8, Math.min(left, window.innerWidth - pr.width - 8));
    if (top + pr.height > window.innerHeight - 8) top = r.top - pr.height - 6;
    top = Math.max(8, top);
    panel.style.top = top + "px";
    panel.style.left = left + "px";
    panel.style.visibility = "visible";
  });
}

/* =========================================================
   Dropdown menu / Select-like popovers
   data-dropdown-trigger="id"  -> click target
   data-dropdown="id"          -> panel (hidden by default)
   optional data-align="end" on trigger
   ========================================================= */
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-dropdown-trigger]");
  if (trigger) {
    const id = trigger.getAttribute("data-dropdown-trigger");
    const panel = document.querySelector(`[data-dropdown="${id}"]`);
    if (!panel) return;
    const isOpen = panel.getAttribute("data-open") === "true";
    closeAllFloating();
    if (!isOpen) {
      panel.setAttribute("data-open", "true");
      positionFloating(trigger, panel, { align: trigger.getAttribute("data-align") || "start" });
      panel.setAttribute("data-animate", "fade-zoom");
    }
    e.stopPropagation();
    return;
  }
  // click on item closes menu (unless data-keep-open)
  const item = e.target.closest(".dropdown-item, [data-dropdown-item]");
  if (item && !item.hasAttribute("data-keep-open")) {
    closeAllFloating();
    return;
  }
  // click outside closes all
  if (!e.target.closest('[data-open="true"]')) closeAllFloating();
});

/* =========================================================
   Popover — same mechanics, generic content
   data-popover-trigger="id" / data-popover="id"
   ========================================================= */
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-popover-trigger]");
  if (!trigger) return;
  const id = trigger.getAttribute("data-popover-trigger");
  const panel = document.querySelector(`[data-popover="${id}"]`);
  if (!panel) return;
  const isOpen = panel.getAttribute("data-open") === "true";
  closeAllFloating();
  if (!isOpen) {
    panel.setAttribute("data-open", "true");
    positionFloating(trigger, panel, { align: trigger.getAttribute("data-align") || "start" });
  }
  e.stopPropagation();
});

/* =========================================================
   Tooltip — hover based
   data-tooltip="Label text"
   ========================================================= */
let tooltipEl = null;
document.addEventListener("mouseover", (e) => {
  const trigger = e.target.closest("[data-tooltip]");
  if (!trigger) return;
  tooltipEl = document.createElement("div");
  tooltipEl.className = "overlay-panel tooltip-panel";
  tooltipEl.textContent = trigger.getAttribute("data-tooltip");
  tooltipEl.style.position = "fixed";
  document.body.appendChild(tooltipEl);
  const r = trigger.getBoundingClientRect();
  const side = trigger.getAttribute("data-tooltip-side") || "top";
  requestAnimationFrame(() => {
    if (!tooltipEl) return;
    const tr = tooltipEl.getBoundingClientRect();
    let left = r.left + r.width / 2 - tr.width / 2;
    let top = side === "top" ? r.top - tr.height - 6 : r.bottom + 6;
    left = Math.max(6, Math.min(left, window.innerWidth - tr.width - 6));
    tooltipEl.style.left = left + "px";
    tooltipEl.style.top = top + "px";
  });
});
document.addEventListener("mouseout", (e) => {
  if (e.target.closest("[data-tooltip]") && tooltipEl) {
    tooltipEl.remove();
    tooltipEl = null;
  }
});

/* =========================================================
   Tabs
   data-tabs (container) / data-tab-trigger="name" / data-tab-panel="name"
   ========================================================= */
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-tab-trigger]");
  if (!trigger) return;
  const container = trigger.closest("[data-tabs]");
  const name = trigger.getAttribute("data-tab-trigger");
  container.querySelectorAll("[data-tab-trigger]").forEach((t) => t.classList.toggle("active", t === trigger));
  container.querySelectorAll("[data-tab-panel]").forEach((p) => {
    p.classList.toggle("hidden", p.getAttribute("data-tab-panel") !== name);
  });
});

/* =========================================================
   Dialog (modal)
   data-dialog-trigger="id" / data-dialog="id" wraps overlay+panel, hidden by default
   close via [data-dialog-close] inside, overlay click, or Escape
   ========================================================= */
function openOverlayRoot(root) {
  root.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => root.setAttribute("data-open", "true"));
}
function closeOverlayRoot(root) {
  root.setAttribute("data-open", "false");
  root.classList.add("hidden");
  if (!document.querySelector('.dialog-root:not(.hidden), .sheet-root:not(.hidden)')) {
    document.body.style.overflow = "";
  }
}
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-dialog-trigger]");
  if (trigger) {
    const root = document.querySelector(`[data-dialog="${trigger.getAttribute("data-dialog-trigger")}"]`);
    if (root) openOverlayRoot(root);
    return;
  }
  const sheetTrigger = e.target.closest("[data-sheet-trigger]");
  if (sheetTrigger) {
    const root = document.querySelector(`[data-sheet="${sheetTrigger.getAttribute("data-sheet-trigger")}"]`);
    if (root) openOverlayRoot(root);
    return;
  }
  if (e.target.closest("[data-dialog-close]")) {
    const root = e.target.closest(".dialog-root");
    if (root) closeOverlayRoot(root);
    return;
  }
  if (e.target.closest("[data-sheet-close]")) {
    const root = e.target.closest(".sheet-root");
    if (root) closeOverlayRoot(root);
    return;
  }
  if (e.target.classList.contains("dialog-overlay")) closeOverlayRoot(e.target.closest(".dialog-root"));
  if (e.target.classList.contains("sheet-overlay")) closeOverlayRoot(e.target.closest(".sheet-root"));
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  closeAllFloating();
  const openDialog = document.querySelector('.dialog-root[data-open="true"]');
  if (openDialog) return closeOverlayRoot(openDialog);
  const openSheet = document.querySelector('.sheet-root[data-open="true"]');
  if (openSheet) return closeOverlayRoot(openSheet);
});

/* =========================================================
   Toast
   Usage: showToast({ title, description, variant: 'default'|'success'|'destructive', duration })
   ========================================================= */
function ensureToastViewport() {
  let vp = document.getElementById("toast-viewport");
  if (!vp) {
    vp = document.createElement("div");
    vp.id = "toast-viewport";
    vp.className = "toast-viewport";
    document.body.appendChild(vp);
  }
  return vp;
}
const TOAST_ICONS = {
  default: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="10"/></svg>',
  success: '<svg class="icon" style="color:hsl(var(--success))" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
  destructive: '<svg class="icon" style="color:hsl(var(--destructive))" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
};
function showToast({ title = "", description = "", variant = "default", duration = 3500 } = {}) {
  const vp = ensureToastViewport();
  const el = document.createElement("div");
  el.className = "toast animate-slide-in-right";
  el.innerHTML = `${TOAST_ICONS[variant] || TOAST_ICONS.default}<div class="flex-1 min-w-0"><p class="toast-title">${title}</p>${description ? `<p class="toast-desc">${description}</p>` : ""}</div><button class="btn-ghost btn-icon-sm shrink-0" aria-label="Close" onclick="this.closest('.toast').remove()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 6 6 18M6 6l12 12"/></svg></button>`;
  vp.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

/* =========================================================
   Sidebar collapse (dashboards) + mobile nav
   ========================================================= */
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-sidebar-toggle]")) {
    document.documentElement.classList.toggle("sidebar-collapsed");
    localStorage.setItem("saas-mock-sidebar", document.documentElement.classList.contains("sidebar-collapsed") ? "1" : "0");
  }
  if (e.target.closest("[data-mobile-nav-toggle]")) {
    document.getElementById("mobile-sidebar")?.classList.toggle("hidden");
  }
});
(function initSidebarState() {
  if (localStorage.getItem("saas-mock-sidebar") === "1") {
    document.documentElement.classList.add("sidebar-collapsed");
  }
})();