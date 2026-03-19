<script>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useAuth } from '../composables/useAuth'
import { useTheme } from '../composables/useTheme'
import LanguageSwitcher from './LanguageSwitcher.vue'

export default {
  name: 'SidebarNav',
  components: { LanguageSwitcher },
  props: {
    collapsed: {
      type: Boolean,
      default: false
    },
    mobileOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:collapsed', 'close', 'show-profile-details', 'show-tasks'],
  setup(props, { emit }) {
    const route = useRoute()
    const { t } = useI18n()
    const { currentUser, getInitials } = useAuth()
    const { isDark, toggleTheme } = useTheme()

    const navItems = computed(() => [
      {
        path: '/',
        label: t('nav.overview'),
        exact: true
      },
      {
        path: '/inventory',
        label: t('nav.inventory')
      },
      {
        path: '/orders',
        label: t('nav.orders')
      },
      {
        path: '/spending',
        label: t('nav.finance')
      },
      {
        path: '/demand',
        label: t('nav.demandForecast')
      },
      {
        path: '/reports',
        label: t('nav.reports')
      },
      {
        path: '/restocking',
        label: t('restocking.navTitle')
      }
    ])

    const isActive = (item) => {
      if (item.exact) {
        return route.path === item.path
      }
      return route.path.startsWith(item.path)
    }

    const toggleCollapsed = () => {
      const next = !props.collapsed
      localStorage.setItem('sidebar-collapsed', String(next))
      emit('update:collapsed', next)
    }

    const handleNavClick = () => {
      // On mobile, close the drawer after navigation
      if (props.mobileOpen) {
        emit('close')
      }
    }

    const userInitials = computed(() => {
      return getInitials(currentUser.value.name)
    })

    return {
      t,
      navItems,
      isActive,
      toggleCollapsed,
      handleNavClick,
      currentUser,
      userInitials,
      isDark,
      toggleTheme
    }
  }
}
</script>

<template>
  <!-- Mobile backdrop -->
  <div
    v-if="mobileOpen"
    class="sidebar-backdrop"
    @click="$emit('close')"
  />

  <aside
    class="sidebar"
    :class="{
      'sidebar--collapsed': collapsed,
      'sidebar--mobile-open': mobileOpen
    }"
  >
    <!-- Logo area -->
    <div class="sidebar__logo">
      <div class="sidebar__logo-mark">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="6" fill="#f59e0b" />
          <path d="M7 14h14M14 7v14" stroke="#0c0f1a" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      </div>
      <div class="sidebar__logo-text" :class="{ 'sidebar__logo-text--hidden': collapsed }">
        <span class="sidebar__brand-name">{{ t('nav.companyName') }}</span>
      </div>
    </div>

    <!-- Navigation links -->
    <nav class="sidebar__nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="sidebar__nav-item"
        :class="{ 'sidebar__nav-item--active': isActive(item) }"
        @click="handleNavClick"
      >
        <!-- Overview icon: grid/dashboard -->
        <svg v-if="item.path === '/'" class="sidebar__nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <!-- Inventory icon: box/package -->
        <svg v-else-if="item.path === '/inventory'" class="sidebar__nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        <!-- Orders icon: clipboard/list -->
        <svg v-else-if="item.path === '/orders'" class="sidebar__nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="13" y2="16" />
        </svg>
        <!-- Finance icon: dollar/chart -->
        <svg v-else-if="item.path === '/spending'" class="sidebar__nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <!-- Demand icon: trending-up -->
        <svg v-else-if="item.path === '/demand'" class="sidebar__nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
        <!-- Reports icon: bar-chart -->
        <svg v-else-if="item.path === '/reports'" class="sidebar__nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
        <!-- Restocking icon: refresh/restock -->
        <svg v-else-if="item.path === '/restocking'" class="sidebar__nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>

        <span class="sidebar__nav-label" :class="{ 'sidebar__nav-label--hidden': collapsed }">
          {{ item.label }}
        </span>
      </router-link>
    </nav>

    <!-- Divider -->
    <div class="sidebar__divider" />

    <!-- Language switcher -->
    <div class="sidebar__lang" :class="{ 'sidebar__lang--collapsed': collapsed }">
      <LanguageSwitcher />
    </div>

    <!-- Divider -->
    <div class="sidebar__divider" />

    <!-- Dark mode toggle -->
    <button
      class="sidebar__theme-toggle"
      :class="{ 'sidebar__theme-toggle--collapsed': collapsed }"
      @click="toggleTheme"
      :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      :aria-pressed="isDark"
    >
      <!-- Sun icon (shown in dark mode — click to go light) -->
      <svg
        v-if="isDark"
        class="sidebar__theme-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      <!-- Moon icon (shown in light mode — click to go dark) -->
      <svg
        v-else
        class="sidebar__theme-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <span class="sidebar__theme-label" :class="{ 'sidebar__theme-label--hidden': collapsed }">
        {{ isDark ? 'Light mode' : 'Dark mode' }}
      </span>
    </button>

    <!-- Divider -->
    <div class="sidebar__divider" />

    <!-- Profile area -->
    <div
      class="sidebar__profile"
      :class="{ 'sidebar__profile--collapsed': collapsed }"
      @click="$emit('show-profile-details')"
    >
      <div class="sidebar__avatar">
        {{ userInitials }}
      </div>
      <div class="sidebar__profile-info" :class="{ 'sidebar__profile-info--hidden': collapsed }">
        <span class="sidebar__profile-name">{{ currentUser.name }}</span>
        <span class="sidebar__profile-role">{{ currentUser.jobTitle }}</span>
      </div>
    </div>

    <!-- Collapse toggle (hidden on mobile) -->
    <button
      class="sidebar__toggle"
      :class="{ 'sidebar__toggle--collapsed': collapsed }"
      @click="toggleCollapsed"
      :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline v-if="!collapsed" points="15 18 9 12 15 6" />
        <polyline v-else points="9 18 15 12 9 6" />
      </svg>
    </button>
  </aside>
</template>

<style scoped>
/* ===== Backdrop (mobile) ===== */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 199;
}

/* ===== Sidebar container ===== */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 260px;
  background: #0c0f1a;
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: width 0.2s ease;
  overflow: visible;
}

.sidebar--collapsed {
  width: 72px;
}

/* ===== Logo area ===== */
.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  min-height: 68px;
}

.sidebar__logo-mark {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.sidebar__logo-text {
  overflow: hidden;
  white-space: nowrap;
  transition: opacity 0.2s ease, width 0.2s ease;
  opacity: 1;
  width: auto;
}

.sidebar__logo-text--hidden {
  opacity: 0;
  width: 0;
  pointer-events: none;
}

.sidebar__brand-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  color: #e2e0db;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

/* ===== Navigation ===== */
.sidebar__nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.75rem 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.sidebar__nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar__nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  margin: 0.125rem 0.5rem;
  border-radius: 6px;
  text-decoration: none;
  color: #64748b;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  border-left: 3px solid transparent;
  position: relative;
}

.sidebar__nav-item:hover {
  background: #1a1f35;
  color: #e2e0db;
}

.sidebar__nav-item--active {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border-left-color: #f59e0b;
}

.sidebar__nav-item--active:hover {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.sidebar__nav-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.sidebar__nav-label {
  overflow: hidden;
  white-space: nowrap;
  transition: opacity 0.2s ease, width 0.2s ease;
  opacity: 1;
}

.sidebar__nav-label--hidden {
  opacity: 0;
  width: 0;
  overflow: hidden;
  pointer-events: none;
}

/* ===== Divider ===== */
.sidebar__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 0.25rem 0;
  flex-shrink: 0;
}

/* ===== Language switcher area ===== */
.sidebar__lang {
  padding: 0.5rem 0.5rem;
  flex-shrink: 0;
  overflow: visible;
  transition: opacity 0.2s ease;
}

.sidebar__lang--collapsed {
  opacity: 0;
  pointer-events: none;
  height: 0;
  padding: 0;
}

/* ===== Theme toggle ===== */
.sidebar__theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 1.5rem;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.sidebar__theme-toggle:hover {
  background: #1a1f35;
  color: #e2e0db;
}

.sidebar__theme-toggle:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: -2px;
}

.sidebar__theme-toggle--collapsed {
  justify-content: center;
  padding: 0.625rem 0;
}

.sidebar__theme-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
}

.sidebar__theme-label {
  overflow: hidden;
  white-space: nowrap;
  transition: opacity 0.2s ease, width 0.2s ease;
  opacity: 1;
}

.sidebar__theme-label--hidden {
  opacity: 0;
  width: 0;
  overflow: hidden;
  pointer-events: none;
}

/* ===== Profile area ===== */
.sidebar__profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
  min-height: 64px;
}

.sidebar__profile:hover {
  background: #1a1f35;
}

.sidebar__profile--collapsed {
  justify-content: center;
  padding: 0.875rem 0;
}

.sidebar__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.sidebar__profile-info {
  overflow: hidden;
  transition: opacity 0.2s ease, width 0.2s ease;
  opacity: 1;
}

.sidebar__profile-info--hidden {
  opacity: 0;
  width: 0;
  pointer-events: none;
}

.sidebar__profile-name {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #e2e0db;
  white-space: nowrap;
  line-height: 1.3;
}

.sidebar__profile-role {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.6875rem;
  color: #64748b;
  white-space: nowrap;
  line-height: 1.3;
}

/* ===== Collapse toggle ===== */
.sidebar__toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background: none;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.sidebar__toggle:hover {
  background: #1a1f35;
  color: #e2e0db;
}

/* ===== Mobile: drawer behavior ===== */
@media (max-width: 768px) {
  .sidebar {
    /* Off-screen by default on mobile */
    transform: translateX(-100%);
    transition: transform 0.25s ease, width 0.2s ease;
    width: 260px;
  }

  .sidebar--mobile-open {
    transform: translateX(0);
  }

  /* Hide the toggle button on mobile */
  .sidebar__toggle {
    display: none;
  }
}
</style>
