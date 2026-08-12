const ADMIN_NAV = [
  { group: "Platform", items: [
    { key: "dashboard", label: "Dashboard", icon: "layout-dashboard", href: "dashboard.html" },
    { key: "tenants", label: "Tenants", icon: "building-2", href: "tenants.html" },
    { key: "users", label: "Users", icon: "users", href: "users.html" },
    { key: "roles", label: "Roles & Permissions", icon: "shield", href: "roles.html" },
  ]},
  { group: "Monetization", items: [
    { key: "plans", label: "Plans & Subscriptions", icon: "credit-card", href: "plans.html" },
  ]},
  { group: "Engagement", items: [
    { key: "tickets", label: "Support Tickets", icon: "life-buoy", href: "tickets.html", chip: "27" },
    { key: "feature-flags", label: "Feature Flags", icon: "flag", href: "feature-flags.html" },
    { key: "announcements", label: "Announcements", icon: "megaphone", href: "announcements.html" },
    { key: "broadcast", label: "Broadcast", icon: "radio", href: "broadcast.html" },
  ]},
  { group: "Communications", items: [
    { key: "emails", label: "Emails", icon: "mail", href: "emails/overview.html", children: [
      { key: "email-overview", label: "Overview", href: "emails/overview.html" },
      { key: "email-templates", label: "Templates", href: "emails/templates.html" },
      { key: "email-queue", label: "Queue & retries", href: "emails/queue.html" },
      { key: "email-delivery", label: "Delivery & bounces", href: "emails/delivery.html" },
    ]},
  ]},
  { group: "System", items: [
    { key: "audit-logs", label: "Audit Logs", icon: "history", href: "audit-logs.html" },
    { key: "settings", label: "Platform Settings", icon: "settings", href: "settings.html" },
  ]},
];

const PAGE_TITLES = {
  "dashboard": "Dashboard", "tenants": "Tenants", "users": "Users", "roles": "Roles & Permissions",
  "plans": "Plans & Subscriptions", "tickets": "Support Tickets", "feature-flags": "Feature Flags",
  "announcements": "Announcements", "broadcast": "Broadcast", "email-overview": "Emails",
  "email-templates": "Email Templates", "email-queue": "Email Queue & Retries", "email-delivery": "Delivery & Bounce Handling",
  "audit-logs": "Audit Logs", "settings": "Platform Settings",
};

function renderAdminShell() {
  const page = document.body.getAttribute("data-page") || "";
  const inSubfolder = location.pathname.includes("/emails/");
  const root = inSubfolder ? "../" : "";

  const sidebar = document.getElementById("admin-sidebar");
  const topbar = document.getElementById("admin-topbar");
  if (!sidebar || !topbar) return;

  sidebar.className = "sidebar-fixed";
  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="w-7 h-7 rounded-md bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center shrink-0"><i data-lucide="shield" style="width:15px;height:15px"></i></div>
      <div class="brand-text leading-tight">
        <p class="text-sm font-semibold">Nimbus Admin</p>
        <p class="text-[10px] text-muted-foreground">Platform console</p>
      </div>
    </div>
    <nav class="sidebar-nav scroll-thin">
      ${ADMIN_NAV.map((g) => `
        <p class="nav-group-label">${g.group}</p>
        ${g.items.map((item) => `
          <a href="${root}${item.href}" class="nav-link ${page === item.key || (item.children && item.children.some(c=>c.key===page)) ? "active" : ""}">
            <i data-lucide="${item.icon}"></i>
            <span class="nav-text">${item.label}</span>
            ${item.chip ? `<span class="nav-chip">${item.chip}</span>` : ""}
          </a>
          ${item.children ? `<div class="subnav mb-1">${item.children.map((c) => `<a href="${root}${c.href}" class="nav-link ${page === c.key ? "active" : ""}" style="font-size:.78rem;padding-top:.32rem;padding-bottom:.32rem"><span class="nav-text">${c.label}</span></a>`).join("")}</div>` : ""}
        `).join("")}
      `).join("")}
    </nav>
    <div class="sidebar-footer">
      <button class="btn btn-ghost btn-sm w-full justify-start" data-sidebar-toggle>
        <i data-lucide="panel-left"></i> <span class="nav-text">Collapse</span>
      </button>
      <a href="${root}../index.html" class="btn btn-ghost btn-sm w-full justify-start mt-1">
        <i data-lucide="log-out"></i> <span class="nav-text">Exit prototype</span>
      </a>
    </div>
  `;

  topbar.className = "shell-topbar";
  topbar.innerHTML = `
    <div class="flex items-center gap-3 min-w-0">
      <button class="btn btn-ghost btn-icon lg:hidden" id="mobile-sidebar-btn"><i data-lucide="menu"></i></button>
      <button class="input-sm input w-64 hidden md:flex items-center gap-2 text-muted-foreground cursor-pointer" id="cmdk-open" style="height:2.1rem">
        <i data-lucide="search" style="width:14px;height:14px"></i> <span class="text-xs">Search tenants, users...</span>
        <span class="kbd ml-auto">⌘K</span>
      </button>
    </div>
    <div class="flex items-center gap-1.5 shrink-0">
      <button class="btn btn-ghost btn-icon md:hidden" id="cmdk-open-mobile"><i data-lucide="search"></i></button>
      <button class="btn btn-ghost btn-icon" data-theme-toggle onclick="Theme.toggle()">
        <i data-lucide="sun" class="dark:hidden"></i><i data-lucide="moon" class="hidden dark:block"></i>
      </button>
      <button class="btn btn-ghost btn-icon relative" data-dropdown-trigger="admin-notifs" data-align="end">
        <i data-lucide="bell"></i>
        <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive"></span>
      </button>
      <div class="overlay-panel dropdown-menu hidden w-80" data-dropdown="admin-notifs" style="padding:0">
        <div class="px-3.5 py-2.5 border-b border-border flex items-center justify-between">
          <p class="text-sm font-semibold">Notifications</p><button class="btn btn-ghost btn-sm" style="height:auto;padding:2px 6px">Mark all read</button>
        </div>
        <div class="max-h-80 overflow-y-auto scroll-thin">
          <div class="dropdown-item items-start" style="cursor:default"><i data-lucide="alert-triangle" class="mt-0.5" style="color:hsl(var(--warning))"></i><div><p class="text-foreground">Payment failed — Stark Cloud</p><p class="text-xs text-muted-foreground mt-0.5">12 minutes ago</p></div></div>
          <div class="dropdown-item items-start" style="cursor:default"><i data-lucide="life-buoy" class="mt-0.5"></i><div><p class="text-foreground">New urgent ticket #4021</p><p class="text-xs text-muted-foreground mt-0.5">44 minutes ago</p></div></div>
          <div class="dropdown-item items-start" style="cursor:default"><i data-lucide="building-2" class="mt-0.5"></i><div><p class="text-foreground">Pied Piper started a trial</p><p class="text-xs text-muted-foreground mt-0.5">3 hours ago</p></div></div>
        </div>
        <div class="px-3.5 py-2 border-t border-border"><a href="#" class="text-xs text-primary font-medium">View all notifications</a></div>
      </div>
      <button class="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-md hover:bg-accent" data-dropdown-trigger="admin-user" data-align="end">
        <div class="avatar w-7 h-7">SA</div>
        <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-muted-foreground hidden sm:block"></i>
      </button>
      <div class="overlay-panel dropdown-menu hidden" data-dropdown="admin-user">
        <div class="px-2 py-1.5 mb-1"><p class="text-sm font-medium">Sofia Alvarez</p><p class="text-xs text-muted-foreground">sofia@nimbus.io · Super Admin</p></div>
        <div class="dropdown-sep"></div>
        <a class="dropdown-item" href="${root}settings.html"><i data-lucide="settings"></i> Platform settings</a>
        <a class="dropdown-item" href="${root}../tenant/dashboard.html"><i data-lucide="building-2"></i> Switch to workspace view</a>
        <div class="dropdown-sep"></div>
        <a class="dropdown-item danger" href="${root}../index.html"><i data-lucide="log-out"></i> Log out</a>
      </div>
    </div>
  `;

  document.getElementById("mobile-sidebar-btn")?.addEventListener("click", () => document.documentElement.classList.toggle("mobile-sidebar-open"));
  document.addEventListener("click", (e) => {
    if (document.documentElement.classList.contains("mobile-sidebar-open") && !e.target.closest(".sidebar-fixed") && !e.target.closest("#mobile-sidebar-btn")) {
      document.documentElement.classList.remove("mobile-sidebar-open");
    }
  });

  injectCommandPalette(root);
  if (window.lucide) lucide.createIcons();
}

function injectCommandPalette(root) {
  const el = document.createElement("div");
  el.innerHTML = `
  <div class="dialog-root hidden fixed inset-0" data-dialog="cmdk">
    <div class="dialog-overlay"></div>
    <div class="dialog-panel command-k-panel fixed left-1/2 top-24 -translate-x-1/2 overflow-hidden flex flex-col">
      <div class="flex items-center gap-2 px-3.5 border-b border-border">
        <i data-lucide="search" class="w-4 h-4 text-muted-foreground"></i>
        <input class="flex-1 bg-transparent border-0 h-11 text-sm focus:outline-none" placeholder="Search tenants, users, tickets, settings..." autofocus>
      </div>
      <div class="overflow-y-auto scroll-thin p-2">
        <p class="dropdown-label">Quick actions</p>
        <a href="${root}tenants.html" class="command-k-item"><i data-lucide="plus"></i> Add new tenant</a>
        <a href="${root}users.html" class="command-k-item"><i data-lucide="user-plus"></i> Invite platform user</a>
        <a href="${root}broadcast.html" class="command-k-item"><i data-lucide="radio"></i> Send broadcast notification</a>
        <p class="dropdown-label mt-1">Navigate</p>
        <a href="${root}tenants.html" class="command-k-item"><i data-lucide="building-2"></i> Tenants</a>
        <a href="${root}roles.html" class="command-k-item"><i data-lucide="shield"></i> Roles & permissions</a>
        <a href="${root}tickets.html" class="command-k-item"><i data-lucide="life-buoy"></i> Support tickets</a>
        <a href="${root}emails/overview.html" class="command-k-item"><i data-lucide="mail"></i> Emails</a>
      </div>
    </div>
  </div>`;
  document.body.appendChild(el.firstElementChild);
  document.getElementById("cmdk-open")?.addEventListener("click", () => document.querySelector('[data-dialog="cmdk"]').classList.remove("hidden") || openOverlayRoot(document.querySelector('[data-dialog="cmdk"]')));
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

document.addEventListener("DOMContentLoaded", renderAdminShell);