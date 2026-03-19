---
name: vue-analyzer
description: Analyzes Vue 3 component structure and suggests optimizations for performance and code reuse
argument-hint: "[component-path, directory-path, or 'all' for entire client/src]"
---

# Vue Component Analyzer

Analyze Vue 3 components for performance issues, code reuse opportunities, and structural improvements. This skill reads components, identifies problems, and provides actionable recommendations with code examples.

## Trigger

Use when the user asks to:
- Analyze Vue component performance
- Find code reuse opportunities across components
- Review component structure or architecture
- Optimize reactivity, rendering, or bundle size
- Identify duplicated logic across views

## Process

### Phase 1: Discovery

1. **Determine scope** from the user's argument:
   - Specific file path → analyze that component
   - Directory path → analyze all `.vue` files in that directory
   - `all` → analyze everything under `client/src/`
2. **Read each component** and extract:
   - Script setup vs Options API usage
   - Props, emits, expose definitions
   - Reactive state (`ref`, `reactive`, `computed`, `watch`)
   - Composable imports (`use*` functions)
   - Component imports and registrations
   - Template complexity (v-for nesting depth, inline expressions, event handlers)
   - Style scoping and CSS size

### Phase 2: Performance Analysis

Check each component against these rules, ordered by impact:

#### P1 — Critical (causes unnecessary re-renders or memory leaks)

| Issue | What to look for | Fix |
|-------|-----------------|-----|
| Missing `key` in `v-for` | `v-for` without `:key`, or using array index as key on mutable lists | Use a stable unique identifier (e.g., `item.id`, `item.sku`) |
| Expensive computed without memoization | Computed properties that iterate large arrays, sort, or do O(n²) work | Extract to composable with `computed`; consider pagination or virtualization |
| Reactive object holding static data | `ref()` or `reactive()` wrapping data that never changes after init | Use `Object.freeze()` or plain `const` |
| Unbounded watchers | `watch` or `watchEffect` without cleanup, especially those create timers, listeners, or subscriptions | Return cleanup function from `watchEffect`, or use `onUnmounted` |
| Large v-for without virtual scrolling | `v-for` rendering 100+ items in DOM simultaneously | Use virtual scroll (`vue-virtual-scroller`) or paginate |
| Inline functions in template | `@click="() => doSomething(item)"` inside `v-for` — creates new function each render | Extract to a method that accepts the item |

#### P2 — Moderate (affects bundle size or maintainability)

| Issue | What to look for | Fix |
|-------|-----------------|-----|
| Synchronous component imports | `import HeavyComponent from './HeavyComponent.vue'` for rarely-shown components (modals, drawers, tabs) | Use `defineAsyncComponent(() => import('./HeavyComponent.vue'))` |
| Duplicated data-fetching logic | Multiple components with similar `onMounted` → `fetch` → `ref` patterns | Extract to a composable (`useFetchData`, `useInventory`, etc.) |
| Props drilling > 2 levels | A prop passed through an intermediate component unchanged | Use `provide`/`inject` or a composable with shared state |
| Oversized component (> 300 lines) | Single `.vue` file doing too many things | Split into sub-components or extract logic into composables |
| Duplicated template patterns | Same card/table/badge markup repeated across views | Extract to a shared component (`BaseCard`, `StatusBadge`, `DataTable`) |

#### P3 — Minor (style and consistency)

| Issue | What to look for | Fix |
|-------|-----------------|-----|
| Mixed API styles | Some components use Options API, others Composition API `<script setup>` | Standardize on `<script setup>` (project convention) |
| Complex inline template expressions | `{{ items.filter(i => i.status === 'active').length }}` | Move to a computed property |
| Unused imports or variables | Imported but never referenced in template or script | Remove dead code |
| Missing component name | Options API component without explicit `name` property | Add `name` for devtools debugging |
| Non-scoped styles leaking | `<style>` without `scoped` attribute | Add `scoped` or use CSS modules |

### Phase 3: Code Reuse Analysis

1. **Composable extraction candidates**: Scan for repeated patterns across components:
   - Identical or near-identical `ref` + `onMounted` fetch patterns → `useResource(endpoint)`
   - Shared filter/sort logic → `useFiltered(items, filters)`
   - Common formatting (currency, dates, percentages) → `useFormatters()`
   - Shared modal open/close state → `useModal()`

2. **Shared component candidates**: Look for repeated template structures:
   - Stat/metric cards with icon + value + label → `<StatCard>`
   - Status badges with color mapping → `<StatusBadge>`
   - Data tables with sort + filter + pagination → `<DataTable>`
   - Empty states with icon + message → `<EmptyState>`
   - Page headers with title + description → `<PageHeader>`

3. **Quantify the savings**: For each candidate, report:
   - How many components would benefit
   - Approximate lines of code saved
   - Whether it's a quick refactor or a larger effort

### Phase 4: Report

Output a structured report with these sections:

```
## Component Analysis: [scope]

### Summary
- Components analyzed: N
- Issues found: N critical, N moderate, N minor
- Code reuse opportunities: N

### Critical Issues
[Table: Component | Issue | Line(s) | Recommended Fix]

### Moderate Issues
[Table: Component | Issue | Line(s) | Recommended Fix]

### Code Reuse Opportunities
[For each opportunity: what to extract, which components benefit, example implementation]

### Quick Wins
[Top 3-5 changes with highest impact-to-effort ratio]
```

## Rules

- **Read before recommending.** Never suggest fixes for code you haven't read.
- **Be specific.** Reference exact file paths, line numbers, and variable names.
- **Show code.** Include before/after snippets for each recommendation.
- **Prioritize by impact.** Critical issues first, then moderate, then minor.
- **Respect existing patterns.** If the project uses Options API in some places, note the inconsistency but don't rewrite everything — suggest a migration path.
- **Don't over-engineer.** Three similar lines of code is not worth an abstraction. Flag reuse opportunities only when 3+ components share the pattern.
- **Delegate to vue-expert.** If the user wants to implement a recommendation, delegate the actual code changes to the `vue-expert` subagent per CLAUDE.md rules.
