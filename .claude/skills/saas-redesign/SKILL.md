---
name: saas-redesign
description: Redesigns a Vue 3 application's UI into a modern SaaS-style interface with vertical navigation sidebar, consistent spacing, and professional polish. Use when asked to modernize a UI, add a sidebar nav, or make the app look like a SaaS dashboard.
argument-hint: "[target-view or 'full' for entire app]"
---

# SaaS UI Redesign Skill

Transform a Vue 3 application from a top-nav layout into a modern SaaS-style interface with a collapsible vertical sidebar, consistent design tokens, and polished professional look.

## Scope

The `$ARGUMENTS` parameter controls what gets redesigned:
- `full` or no argument: Redesign the entire app (layout shell + all views)
- A specific view name (e.g., `Dashboard`, `Orders`): Redesign only that view to match SaaS patterns

## Phase 1: Discovery

Before making any changes, read and understand the existing application:

1. **Read the root layout** — Find the main `App.vue` (or equivalent shell component) to understand current navigation structure, route definitions, and global styles
2. **Inventory all views** — Glob for `views/*.vue` or `pages/*.vue` to catalog every page
3. **Check the router** — Read `main.js` or `router.js` to get the full route list and nav items
4. **Identify design tokens** — Note existing colors, fonts, spacing, border-radius values, and any CSS custom properties already in use
5. **Check for i18n** — If the app uses i18n (locales files, `t()` function), all new UI text must use translation keys
6. **Check for existing component patterns** — Read 2-3 existing views to understand the Options API vs Composition API style, naming conventions, and shared component usage

## Phase 2: Design Token System

Create or update a CSS custom properties system. Place these as global `:root` variables in `App.vue` (or a dedicated `variables.css` if one exists).

### Required Token Categories

```css
:root {
  /* --- Sidebar --- */
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 72px;
  --sidebar-bg: #0f172a;
  --sidebar-text: #94a3b8;
  --sidebar-text-active: #ffffff;
  --sidebar-accent: #3b82f6;
  --sidebar-hover-bg: #1e293b;
  --sidebar-border: #1e293b;
  --sidebar-transition: 0.2s ease;

  /* --- Layout --- */
  --header-height: 64px;
  --content-max-width: 1400px;
  --page-padding: 1.5rem;
  --page-padding-mobile: 1rem;

  /* --- Spacing scale (4px base) --- */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;

  /* --- Colors --- */
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;
  --color-border-light: #f1f5f9;
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-tertiary: #94a3b8;

  /* --- Status colors --- */
  --color-success: #059669;
  --color-success-bg: #d1fae5;
  --color-warning: #d97706;
  --color-warning-bg: #fef3c7;
  --color-danger: #dc2626;
  --color-danger-bg: #fee2e2;
  --color-info: #2563eb;
  --color-info-bg: #dbeafe;

  /* --- Interactive --- */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-light: #eff6ff;

  /* --- Typography --- */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 0.9375rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;

  /* --- Elevation --- */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04);

  /* --- Border radius --- */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

Adapt the specific color values to match the app's existing palette where possible — the goal is to systematize, not to arbitrarily rebrand.

## Phase 3: Sidebar Component

Create a new `Sidebar.vue` component (or `SidebarNav.vue`). This is the centerpiece of the redesign.

### Structure Requirements

```
Sidebar
├── Logo / Brand area (top)
├── Navigation links (middle, scrollable)
│   ├── Nav items with icons + labels
│   ├── Active state indicator (left border or background highlight)
│   └── Optional section dividers
├── Collapse toggle button (bottom or top)
└── User / profile area (bottom)
```

### Behavior Requirements

- **Collapsible**: Toggle between full width (show icons + labels) and collapsed (icons only with tooltips)
- **Persist collapse state**: Use `localStorage` to remember collapsed/expanded preference
- **Active route highlighting**: Use `$route.path` or `router-link-active` class
- **Responsive**: On mobile (<768px), sidebar becomes an overlay drawer triggered by a hamburger menu
- **Smooth transitions**: All width/opacity changes animated with `transition`
- **Keyboard accessible**: All nav items focusable, collapse toggle has aria-label

### Icon Approach

Use inline SVG icons for each nav item. Keep them simple (24x24 viewBox). If the project already uses an icon library, use that instead.

### Collapse Toggle

Place a chevron icon at the bottom of the sidebar (or in the header area). On click:
- Toggle a `collapsed` ref
- Save state to `localStorage.setItem('sidebar-collapsed', 'true'|'false')`
- On mount, read `localStorage.getItem('sidebar-collapsed')` to restore

### Mobile Drawer Behavior

Below 768px:
- Sidebar is hidden off-screen by default (`transform: translateX(-100%)`)
- A hamburger button appears in the top header bar
- Clicking it slides sidebar in as an overlay with a backdrop
- Clicking a nav link or the backdrop closes the drawer
- Emit an event or use a shared ref for the toggle state

## Phase 4: Layout Shell Transformation

Modify `App.vue` to replace the top-nav layout with a sidebar layout.

### Target Layout Structure

```html
<div class="app-layout">
  <Sidebar />
  <div class="main-area" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <header class="top-bar">
      <!-- Mobile hamburger (shown < 768px) -->
      <!-- Page-level actions, search, user avatar, etc. -->
    </header>
    <!-- Keep FilterBar if it exists -->
    <main class="page-content">
      <router-view />
    </main>
  </div>
</div>
```

### CSS Layout

```css
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-area {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--sidebar-transition);
  display: flex;
  flex-direction: column;
}

.main-area.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed-width);
}

.page-content {
  flex: 1;
  max-width: var(--content-max-width);
  width: 100%;
  margin: 0 auto;
  padding: var(--page-padding);
}

@media (max-width: 768px) {
  .main-area {
    margin-left: 0;
  }
}
```

### What to Remove

- Delete the top `<nav>` bar with horizontal nav links (the sidebar replaces it)
- Remove all horizontal nav-related CSS (`.nav-tabs`, `.nav-container`, `.top-nav` horizontal styles)
- Keep any user menu / language switcher / profile components — relocate them into the sidebar bottom area or the new top bar

## Phase 5: Top Bar (Header)

The top bar replaces the old nav as a thin contextual header:

- **Left side**: Mobile hamburger button (hidden on desktop), optional breadcrumb or page title
- **Right side**: Language switcher, notification bell (if applicable), user avatar / profile menu
- **Style**: White background, subtle bottom border, fixed height (`var(--header-height)`), `position: sticky; top: 0`

## Phase 6: View-Level Polish

For each view that is in scope, apply these consistent patterns:

### Page Headers
```css
.page-header {
  margin-bottom: var(--space-6);
}
.page-header h2 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.025em;
}
.page-header p {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}
```

### Stat Cards
- Use CSS Grid: `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`
- Card padding: `var(--space-5)`
- Border radius: `var(--radius-lg)`
- Subtle border + hover shadow elevation
- Label: uppercase, small, secondary color
- Value: large, bold, primary or status color

### Tables
- Wrap in `.table-container` with `overflow-x: auto`
- Sticky header with subtle background
- Alternating row hover (not stripes)
- Compact but readable padding
- On mobile: allow horizontal scroll, add a subtle fade-out gradient on the right edge to hint scrollability

### Cards
- Consistent padding: `var(--space-5)`
- Border radius: `var(--radius-lg)`
- Border: `1px solid var(--color-border)`
- Card header: flex row with title left, actions right, bottom border separator

### Buttons
- Primary: solid fill with `var(--color-primary)`, white text, subtle shadow
- Secondary: outline or ghost style
- Consistent padding: `var(--space-2) var(--space-5)`
- Border radius: `var(--radius-md)`
- Hover: darken background, slight shadow lift
- Disabled: reduced opacity, no pointer

### Badges / Status Pills
- Rounded pill shape: `border-radius: 9999px` (or `var(--radius-sm)` for softer rectangles)
- Small text, semibold
- Color-coded background + text pairs for each status

## Phase 7: Responsive Behavior

Implement three breakpoints:

### Desktop (>1024px)
- Full sidebar visible
- Content has max-width constraint
- Multi-column stat grids

### Tablet (768px - 1024px)
- Sidebar collapsed by default (icons only)
- Can expand on hover or click
- Stat grids: 2-3 columns
- Reduced padding

### Mobile (<768px)
- Sidebar hidden, hamburger menu to open as overlay drawer
- Single or 2-column stat grids
- Stacked card layouts
- Full-width buttons
- Filter bar collapses (labels hidden, 2-column grid)
- Sticky header stays, sticky filter bar becomes relative

## Phase 8: Transitions & Micro-interactions

Add subtle polish:

- **Sidebar collapse**: `transition: width 0.2s ease` on sidebar, `margin-left` on main area
- **Nav items**: Smooth background-color transition on hover
- **Cards**: `transition: box-shadow 0.15s ease, border-color 0.15s ease` on hover
- **Page transitions** (optional): `<router-view v-slot="{ Component }">` with `<transition name="fade">` for a subtle fade between pages

## Delegation Rules

- **ALWAYS delegate `.vue` file creation/modification to the `vue-expert` subagent** as required by project conventions (CLAUDE.md)
- When delegating, provide the vue-expert with:
  1. The full design token variables (so it can reference them)
  2. The existing component's code (read it first)
  3. Specific instructions for that component referencing this skill's patterns
  4. Whether the component uses Options API with `setup()` or `<script setup>`
  5. The i18n pattern if applicable (`useI18n` composable, `t()` function, locale file paths)

## Quality Checklist

Before considering the redesign complete, verify:

- [ ] Sidebar renders on all routes with correct active state
- [ ] Collapse/expand works and persists across page reloads
- [ ] Mobile drawer opens/closes cleanly with backdrop
- [ ] All existing navigation links are present in the sidebar
- [ ] No horizontal scrollbar on any viewport width
- [ ] Tables scroll horizontally on mobile without breaking layout
- [ ] All existing functionality still works (filters, data loading, interactions)
- [ ] Transitions are smooth, no layout jumps
- [ ] Color contrast meets WCAG AA (especially sidebar text on dark background)
- [ ] Focus states visible for keyboard navigation
- [ ] No regressions in existing responsive behavior
- [ ] If i18n exists, all new visible text uses translation keys
