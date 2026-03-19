<template>
  <div class="app-layout">
    <!-- Mobile header (shown < 768px only) -->
    <header class="mobile-header">
      <button class="hamburger-btn" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Open navigation">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <span class="mobile-brand">{{ t('nav.companyName') }}</span>
      <ProfileMenu
        @show-profile-details="showProfileDetails = true"
        @show-tasks="showTasks = true"
      />
    </header>

    <SidebarNav
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileMenuOpen"
      @update:collapsed="onSidebarCollapsed"
      @close="mobileMenuOpen = false"
      @show-profile-details="showProfileDetails = true"
      @show-tasks="showTasks = true"
    />

    <div class="main-area" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <FilterBar />
      <main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import SidebarNav from './components/SidebarNav.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    SidebarNav
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    // Sidebar state — initialized from localStorage
    const sidebarCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')
    const mobileMenuOpen = ref(false)

    const onSidebarCollapsed = (value) => {
      sidebarCollapsed.value = value
      localStorage.setItem('sidebar-collapsed', String(value))
    }

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(loadTasks)

    return {
      t,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask,
      sidebarCollapsed,
      mobileMenuOpen,
      onSidebarCollapsed
    }
  }
}
</script>

<style>
/* ===== CSS Reset ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ===== CSS Custom Properties ===== */
:root {
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 72px;
  --sidebar-bg: #0c0f1a;
  --color-bg: #f1f0ee;
  --color-surface: #ffffff;
  --color-border: #e5e2dc;
  --color-border-light: #f0ede8;
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-tertiary: #94a3b8;
  --color-accent: #f59e0b;
  --color-accent-hover: #d97706;
  --color-accent-light: rgba(245, 158, 11, 0.08);
  --color-success: #059669;
  --color-success-bg: #d1fae5;
  --color-warning: #d97706;
  --color-warning-bg: #fef3c7;
  --color-danger: #dc2626;
  --color-danger-bg: #fee2e2;
  --color-info: #2563eb;
  --color-info-bg: #dbeafe;
  --font-heading: 'JetBrains Mono', monospace;
  --font-body: 'DM Sans', sans-serif;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.08);
}

/* ===== Base styles ===== */
body {
  font-family: var(--font-body);
  background: var(--color-bg);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===== Layout ===== */
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-area {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.2s ease;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.main-area.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed-width);
}

.page-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 2rem;
}

/* ===== Mobile header ===== */
.mobile-header {
  display: none;
}

/* ===== Page transition ===== */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.15s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* ===== Page header ===== */
.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1208;
  margin-bottom: 0.375rem;
  letter-spacing: -0.025em;
}

.page-header p {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

/* ===== Stats grid ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

/* ===== Stat card ===== */
.stat-card {
  background: var(--color-surface);
  padding: 1.25rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #d4cfc8;
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.stat-label {
  font-family: var(--font-heading);
  color: var(--color-text-secondary);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.625rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.stat-card.warning .stat-value {
  color: var(--color-warning);
}

.stat-card.success .stat-value {
  color: var(--color-success);
}

.stat-card.danger .stat-value {
  color: var(--color-danger);
}

.stat-card.info .stat-value {
  color: var(--color-info);
}

.stat-card.restocking .stat-value {
  color: var(--color-accent);
}

/* ===== Card ===== */
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  font-family: var(--font-heading);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

/* ===== Table ===== */
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

td {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--color-border-light);
  color: #334155;
  font-size: 0.875rem;
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: #faf9f7;
}

/* ===== Badges ===== */
.badge {
  display: inline-block;
  padding: 0.3125rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge.success {
  background: var(--color-success-bg);
  color: #065f46;
}

.badge.warning {
  background: var(--color-warning-bg);
  color: #92400e;
}

.badge.danger {
  background: var(--color-danger-bg);
  color: #991b1b;
}

.badge.info {
  background: var(--color-info-bg);
  color: #1e40af;
}

.badge.increasing {
  background: var(--color-success-bg);
  color: #065f46;
}

.badge.decreasing {
  background: var(--color-danger-bg);
  color: #991b1b;
}

.badge.stable {
  background: #e0e7ff;
  color: #3730a3;
}

.badge.high {
  background: var(--color-danger-bg);
  color: #991b1b;
}

.badge.medium {
  background: #fed7aa;
  color: #92400e;
}

.badge.low {
  background: var(--color-info-bg);
  color: #1e40af;
}

.badge.restocking {
  background: rgba(245, 158, 11, 0.12);
  color: #92400e;
}

/* ===== Loading / Error states ===== */
.loading {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

.error {
  background: var(--color-danger-bg);
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: var(--radius-md);
  margin: 1rem 0;
  font-size: 0.9375rem;
}

/* ===== Hamburger button ===== */
.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background 0.15s ease;
  flex-shrink: 0;
}

.hamburger-btn:hover {
  background: var(--color-border-light);
}

/* ===== Mobile breakpoint ===== */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
    align-items: center;
    padding: 0 1rem;
    height: 56px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 100;
    gap: 0.75rem;
  }

  .mobile-brand {
    font-family: var(--font-heading);
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-text-primary);
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .app-layout {
    display: block;
  }

  .main-area {
    margin-left: 0 !important;
    display: flex;
    flex-direction: column;
  }

  .page-content {
    padding: 1rem;
    max-width: 100%;
    overflow-x: hidden;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .page-header h2 {
    font-size: 1.25rem;
  }
}
</style>
