const TENANT_NAV = [
  { group: "Workspace", items: [
    { key: "dashboard", label: "Dashboard", icon: "layout-dashboard", href: "dashboard.html" },
    { key: "onboarding", label: "Onboarding", icon: "rocket", href: "onboarding.html", chip: "60%" },
    { key: "members", label: "Members", icon: "users", href: "members.html" },
    { key: "roles", label: "Roles & Permissions", icon: "shield", href: "roles.html" },
    { key: "notifications", label: "Notifications", icon: "bell", href: "notifications.html" },
    { key: "announcements", label: "Announcements", icon: "megaphone", href: "announcements.html" },
  ]},
  { group: "Billing", items: [
    { key: "billing", label: "Billing & Subscription", icon: "credit-card", href: "billing.html" },
  ]},
  { group: "Developer", items: [
    { key: "api", label: "API Access", icon: "plug-zap", href: "api.html" },
  ]},
  { group: "System", items: [
    { key: "settings", label: "Workspace Settings", icon: "settings", href: "settings.html" },
  ]},
];

const WORKSPACES = [
  { id: "acme", name: "Acme Inc.", plan: "Enterprise", initials: "AC" },
  { id: "northwind", name: "Northwind Co.", plan: "Growth", initials: "NW" },
  { id: "sandbox", name: "Sandbox Workspace", plan: "Starter", initials: "SW" },
];
const CURRENT_WORKSPACE = WORKSPACES[0];

function renderTenantShell() {
  const page = document.body.getAttribute("data-page") || "";
  const sidebar = document.getElementById("tenant-sidebar");
  const topbar = document.getElementById("tenant-topbar");
  if (!sidebar || !topbar) return;

  sidebar.className = "sidebar-fixed";
  sidebar.innerHTML = `
    <button class="workspace-switcher w-full" data-dropdown-trigger="ws-switch">
      <div class="workspace-logo">${CURRENT_WORKSPACE.initials}</div>
      <div class="ws-text flex-1 min-w-0 text-left">
        <p class="text-sm font-semibold truncate">${CURRENT_WORKSPACE.name}</p>
        <p class="text-[10px] text-muted-foreground">${CURRENT_WORKSPACE.plan} plan</p>
      </div>
      <i data-lucide="chevrons-up-down" class="ws-text w-3.5 h-3.5 text-muted-foreground shrink-0"></i>
    </button>
    <div class="overlay-panel dropdown-menu hidden w-64" data-dropdown="ws-switch">
      <div class="dropdown-label">Your workspaces</div>
      ${WORKSPACES.map((w) => `
        <button class="dropdown-item ${w.id === CURRENT_WORKSPACE.id ? "active" : ""}" style="justify-content:space-between" onclick="showToast({title:'Switched to ' + '${w.name}'})">
          <span class="flex items-center gap-2"><span class="avatar w-5 h-5" style="font-size:.55rem">${w.initials}</span>${w.name}</span>
          ${w.id === CURRENT_WORKSPACE.id ? '<i data-lucide="check" style="color:hsl(var(--primary))"></i>' : ""}
        </button>`).join("")}
      <div class="dropdown-sep"></div>
      <button class="dropdown-item"><i data-lucide="plus"></i> Create workspace</button>
      <a href="../admin/dashboard.html" class="dropdown-item"><i data-lucide="shield"></i> Switch to admin console</a>
    </div>

    <nav class="sidebar-nav scroll-thin">
      ${TENANT_NAV.map((g) => `
        <p class="nav-group-label">${g.group}</p>
        ${g.items.map((item) => `
          <a href="${item.href}" class="nav-link ${page === item.key ? "active" : ""}">
            <i data-lucide="${item.icon}"></i>
            <span class="nav-text">${item.label}</span>
            ${item.chip ? `<span class="nav-chip">${item.chip}</span>` : ""}
          </a>
        `).join("")}
      `).join("")}
    </nav>
    <div class="sidebar-footer">
      <button class="btn btn-ghost btn-sm w-full justify-start" data-sidebar-toggle>
        <i data-lucide="panel-left"></i> <span class="nav-text">Collapse</span>
      </button>
      <a href="../index.html" class="btn btn-ghost btn-sm w-full justify-start mt-1">
        <i data-lucide="log-out"></i> <span class="nav-text">Exit prototype</span>
      </a>
    </div>
  `;

  topbar.className = "shell-topbar";
  topbar.innerHTML = `
    <div class="flex items-center gap-3 min-w-0">
      <button class="btn btn-ghost btn-icon lg:hidden" id="mobile-sidebar-btn"><i data-lucide="menu"></i></button>
      <button class="input-sm input w-64 hidden md:flex items-center gap-2 text-muted-foreground cursor-pointer" id="cmdk-open" style="height:2.1rem">
        <i data-lucide="search" style="width:14px;height:14px"></i> <span class="text-xs">Search members, settings...</span>
        <span class="kbd ml-auto">⌘K</span>
      </button>
    </div>
    <div class="flex items-center gap-1.5 shrink-0">
      <button class="btn btn-ghost btn-icon md:hidden" id="cmdk-open-mobile"><i data-lucide="search"></i></button>
      <button class="btn btn-ghost btn-icon" data-theme-toggle onclick="Theme.toggle()">
        <i data-lucide="sun" class="dark:hidden"></i><i data-lucide="moon" class="hidden dark:block"></i>
      </button>
      <button class="btn btn-ghost btn-icon relative" data-dropdown-trigger="tenant-notifs" data-align="end">
        <i data-lucide="bell"></i>
        <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive"></span>
      </button>
      <div class="overlay-panel dropdown-menu hidden w-80" data-dropdown="tenant-notifs" style="padding:0">
        <div class="px-3.5 py-2.5 border-b border-border flex items-center justify-between">
          <p class="text-sm font-semibold">Notifications</p><a href="notifications.html" class="text-xs text-primary font-medium">View all</a>
        </div>
        <div class="max-h-80 overflow-y-auto scroll-thin">
          <div class="dropdown-item items-start" style="cursor:default"><i data-lucide="user-plus" class="mt-0.5"></i><div><p class="text-foreground">Jordan accepted your invite</p><p class="text-xs text-muted-foreground mt-0.5">1 hour ago</p></div></div>
          <div class="dropdown-item items-start" style="cursor:default"><i data-lucide="credit-card" class="mt-0.5"></i><div><p class="text-foreground">Invoice #INV-2208 paid</p><p class="text-xs text-muted-foreground mt-0.5">Yesterday</p></div></div>
          <div class="dropdown-item items-start" style="cursor:default"><i data-lucide="megaphone" class="mt-0.5"></i><div><p class="text-foreground">New announcement: RBAC v2</p><p class="text-xs text-muted-foreground mt-0.5">3 days ago</p></div></div>
        </div>
      </div>
      <button class="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-md hover:bg-accent" data-dropdown-trigger="tenant-user" data-align="end">
        <div class="avatar w-7 h-7">JM</div>
        <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-muted-foreground hidden sm:block"></i>
      </button>
      <div class="overlay-panel dropdown-menu hidden" data-dropdown="tenant-user">
        <div class="px-2 py-1.5 mb-1"><p class="text-sm font-medium">Jordan Mensah</p><p class="text-xs text-muted-foreground">jordan@acme.com · Owner</p></div>
        <div class="dropdown-sep"></div>
        <a class="dropdown-item" href="settings.html"><i data-lucide="settings"></i> Workspace settings</a>
        <a class="dropdown-item" href="../admin/dashboard.html"><i data-lucide="shield"></i> Switch to admin console</a>
        <div class="dropdown-sep"></div>
        <a class="dropdown-item danger" href="../index.html"><i data-lucide="log-out"></i> Log out</a>
      </div>
    </div>
  `;

  document.getElementById("mobile-sidebar-btn")?.addEventListener("click", () => document.documentElement.classList.toggle("mobile-sidebar-open"));
  document.addEventListener("click", (e) => {
    if (document.documentElement.classList.contains("mobile-sidebar-open") && !e.target.closest(".sidebar-fixed") && !e.target.closest("#mobile-sidebar-btn")) {
      document.documentElement.classList.remove("mobile-sidebar-open");
    }
  });

  injectTenantCommandPalette();
  if (window.lucide) lucide.createIcons();
}

function injectTenantCommandPalette() {
  const el = document.createElement("div");
  el.innerHTML = `
  <div class="dialog-root hidden fixed inset-0" data-dialog="cmdk">
    <div class="dialog-overlay"></div>
    <div class="dialog-panel command-k-panel fixed left-1/2 top-24 -translate-x-1/2 overflow-hidden flex flex-col">
      <div class="flex items-center gap-2 px-3.5 border-b border-border">
        <i data-lucide="search" class="w-4 h-4 text-muted-foreground"></i>
        <input class="flex-1 bg-transparent border-0 h-11 text-sm focus:outline-none" placeholder="Search members, settings, API tokens..." autofocus>
      </div>
      <div class="overflow-y-auto scroll-thin p-2">
        <p class="dropdown-label">Quick actions</p>
        <a href="members.html" class="command-k-item"><i data-lucide="user-plus"></i> Invite a member</a>
        <a href="api.html" class="command-k-item"><i data-lucide="key-round"></i> Create access token</a>
        <p class="dropdown-label mt-1">Navigate</p>
        <a href="dashboard.html" class="command-k-item"><i data-lucide="layout-dashboard"></i> Dashboard</a>
        <a href="billing.html" class="command-k-item"><i data-lucide="credit-card"></i> Billing & subscription</a>
        <a href="roles.html" class="command-k-item"><i data-lucide="shield"></i> Roles & permissions</a>
        <a href="settings.html" class="command-k-item"><i data-lucide="settings"></i> Workspace settings</a>
      </div>
    </div>
  </div>`;
  document.body.appendChild(el.firstElementChild);
  document.getElementById("cmdk-open")?.addEventListener("click", () => openOverlayRoot(document.querySelector('[data-dialog="cmdk"]')));
  document.getElementById("cmdk-open-mobile")?.addEventListener("click", () => openOverlayRoot(document.querySelector('[data-dialog="cmdk"]')));
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openOverlayRoot(document.querySelector('[data-dialog="cmdk"]'));
      setTimeout(() => document.querySelector('[data-dialog="cmdk"] input')?.focus(), 30);
    }
  });
}

function pageHeader({ title, description, breadcrumb, actionsHtml }) {
  return `
  <div class="page-header">
    <div>
      ${breadcrumb ? `<div class="breadcrumb">${breadcrumb.map((b,i)=>`<span>${b}</span>${i<breadcrumb.length-1?'<i data-lucide="chevron-right"></i>':''}`).join("")}</div>` : ""}
      <h1 class="page-title">${title}</h1>
      ${description ? `<p class="page-desc">${description}</p>` : ""}
    </div>
    ${actionsHtml ? `<div class="flex items-center gap-2">${actionsHtml}</div>` : ""}
  </div>`;
}

document.addEventListener("DOMContentLoaded", renderTenantShell);