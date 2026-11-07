# Graph Report - plartform-pannel  (2026-11-07)

## Corpus Check
- Corpus is ~38,960 words - fits in a single context window. You may not need a graph.

## Summary
- 604 nodes · 2578 edges · 28 communities (18 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 500 input · 300 output

## Community Hubs (Navigation)
- Admin Dashboard & Overview
- Product Moderation Views
- Admin Authentication & Access
- Admin Navigation & Sidebar
- Admin Authentication & Access (2)
- Admin Authentication & Access (3)
- Product Moderation Views (2)
- Store Tenant Management
- dependencies Module
- Next.js Build & Tailwind Config
- query-provider.tsx Module
- package.json Module
- devDependencies Module
- Invoice & ALV Statement Views
- Next.js Build & Tailwind Config (2)
- Next.js Build & Tailwind Config (3)
- scripts Module
- Next.js Agent Guidelines & Rules Module
- class-variance-authority@^0.7.1 Module
- @radix-ui/react-checkbox@^1.3.11 Module
- @radix-ui/react-dialog@^1.1.23 Module
- @radix-ui/react-label@^2.1.15 Module
- @radix-ui/react-popover@^1.1.23 Module
- @radix-ui/react-select@^2.3.7 Module
- @radix-ui/react-separator@^1.1.15 Module
- react-dom@19.2.8 Module
- Next.js Build & Tailwind Config (4)

## God Nodes (most connected - your core abstractions)
1. `cn()` - 95 edges
2. `Button` - 53 edges
3. `react` - 53 edges
4. `Input` - 37 edges
5. `Badge()` - 36 edges
6. `UsersListView()` - 35 edges
7. `UserDetailsView()` - 34 edges
8. `lucide-react` - 33 edges
9. `CategoriesView()` - 32 edges
10. `AdminLayout()` - 32 edges

## Surprising Connections (you probably didn't know these)
- `AuditLogsPage()` --calls--> `AuditLogsView()`  [EXTRACTED]
  app/admin/audit-logs/page.tsx → components/admin/audit-logs/audit-logs-view.tsx
- `CategoriesPage()` --calls--> `CategoriesView()`  [EXTRACTED]
  app/admin/categories/page.tsx → components/admin/categories/categories-view.tsx
- `DashboardPage()` --calls--> `AdminLayout()`  [EXTRACTED]
  app/admin/dashboard/page.tsx → components/admin/layout/admin-layout.tsx
- `InvoicesPage()` --calls--> `InvoicesView()`  [EXTRACTED]
  app/admin/invoices/page.tsx → components/admin/invoices/invoices-view.tsx
- `AdminLoginPage()` --calls--> `AdminLoginView()`  [EXTRACTED]
  app/admin/login/page.tsx → components/admin/auth/login-view.tsx

## Import Cycles
- None detected.

## Communities (28 total, 10 thin omitted)

### Community 0 - "Admin Dashboard & Overview"
Cohesion: 0.06
Nodes (57): DashboardPage(), AdminDashboardView(), RoleDetailsView(), useCreatePermissionMutation(), useDeletePermissionMutation(), useUpdatePermissionMutation(), useAssignRolePermissionMutation(), useCreateRoleMutation() (+49 more)

### Community 1 - "Product Moderation Views"
Cohesion: 0.15
Nodes (56): ProductsPage(), UserPage(), AuditLogsView(), COMMON_ACTIONS, CategoriesView(), TreeCategoryRow(), InvoicesView(), PayoutsView() (+48 more)

### Community 2 - "Admin Authentication & Access"
Cohesion: 0.14
Nodes (43): AdminLoginPage(), AdminLoginView(), CreatePermissionDialog(), CreateRoleDialog(), EditRoleDialog(), ChangeStoreStatusDialog(), STATUS_DESCRIPTIONS, EditStoreDialog() (+35 more)

### Community 3 - "Admin Navigation & Sidebar"
Cohesion: 0.08
Nodes (43): Header(), MobileSidebar(), NavItem, navItems, Sidebar(), Avatar, AvatarFallback, Breadcrumb (+35 more)

### Community 4 - "Admin Authentication & Access (2)"
Cohesion: 0.08
Nodes (44): useChangePasswordMutation(), useLoginMutation(), useLogoutMutation(), useActivateUserMutation(), useAssignUserRoleMutation(), useCreateUserMutation(), useDeactivateUserMutation(), useDeleteUserMutation() (+36 more)

### Community 5 - "Admin Authentication & Access (3)"
Cohesion: 0.07
Nodes (38): SettingsPage(), SettingsView(), apiConfig, appConfig, EnvConfig, envSchema, useTriggerClearanceMutation(), useTriggerPayoutCycleMutation() (+30 more)

### Community 6 - "Product Moderation Views (2)"
Cohesion: 0.09
Nodes (27): ChangeStoreStatusDialogProps, EditStoreDialogProps, useOrders(), useStore(), ordersApi, productsApi, storesApi, GetOrdersParams (+19 more)

### Community 7 - "Store Tenant Management"
Cohesion: 0.15
Nodes (13): AuditLogsPage(), CategoriesPage(), InvoicesPage(), PayoutsPage(), PermissionsPage(), RolePage(), RolesPage(), StoreDetailPage() (+5 more)

### Community 8 - "dependencies Module"
Cohesion: 0.11
Nodes (19): dependencies, axios@^1.20.0, clsx@^2.1.1, @hookform/resolvers@^5.9.1, lucide-react@^1.51.0, @radix-ui/react-slot@^1.3.3, @radix-ui/react-switch@^1.3.7, @radix-ui/react-tabs@^1.1.21 (+11 more)

### Community 9 - "Next.js Build & Tailwind Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "query-provider.tsx Module"
Cohesion: 0.21
Nodes (10): geistMono, geistSans, metadata, RootLayout(), Providers(), Toaster(), ToasterProps, AuthProvider() (+2 more)

### Community 11 - "package.json Module"
Cohesion: 0.15
Nodes (12): @radix-ui/react-alert-dialog@^1.1.23, @radix-ui/react-dropdown-menu@^2.1.24, tailwind-merge@^3.7.0, ignoreScripts, name, packageManager, private, trustedDependencies (+4 more)

### Community 12 - "devDependencies Module"
Cohesion: 0.15
Nodes (13): devDependencies, tailwindcss@^4, @tailwindcss/postcss@^4, @types/node@^20, @types/react@^19, @types/react-dom@^19, typescript@^5, tailwindcss (+5 more)

### Community 13 - "Invoice & ALV Statement Views"
Cohesion: 0.38
Nodes (6): invoicesApi, Invoice, InvoiceItemSnapshot, InvoiceQueryParams, InvoiceStatus, PaginatedInvoicesResponse

### Community 14 - "Next.js Build & Tailwind Config (2)"
Cohesion: 0.25
Nodes (3): nextConfig, next@16.3.8, next

### Community 15 - "Next.js Build & Tailwind Config (3)"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.3.8, eslint, eslint-config-next

### Community 16 - "scripts Module"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 17 - "Next.js Agent Guidelines & Rules Module"
Cohesion: 0.67
Nodes (3): Next.js Agent Guidelines & Rules, Claude Agent Integration Rule Reference, Platform Panel Next.js Application

## Knowledge Gaps
- **2 isolated node(s):** `Platform Panel Next.js Application`, `Claude Agent Integration Rule Reference`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 86 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Admin Authentication & Access` to `Admin Dashboard & Overview`, `Product Moderation Views`, `Admin Navigation & Sidebar`, `Admin Authentication & Access (2)`, `Admin Authentication & Access (3)`, `Store Tenant Management`, `dependencies Module`, `query-provider.tsx Module`, `package.json Module`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **What connects `Platform Panel Next.js Application`, `Claude Agent Integration Rule Reference` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Dashboard & Overview` be split into smaller, more focused modules?**
  _Cohesion score 0.06415396952686447 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `Admin Navigation & Sidebar` to `Product Moderation Views`, `Admin Authentication & Access`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `Admin Authentication & Access` be split into smaller, more focused modules?**
  _Cohesion score 0.14405594405594405 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-query` connect `Admin Dashboard & Overview` to `Product Moderation Views`, `Admin Authentication & Access`, `Admin Authentication & Access (2)`, `Admin Authentication & Access (3)`, `Product Moderation Views (2)`, `dependencies Module`, `query-provider.tsx Module`, `package.json Module`, `Invoice & ALV Statement Views`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Should `Admin Navigation & Sidebar` be split into smaller, more focused modules?**
  _Cohesion score 0.08007013442431327 - nodes in this community are weakly interconnected._