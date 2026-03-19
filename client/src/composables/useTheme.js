import { ref, readonly, watchEffect } from 'vue'

// Module-level singleton so all consumers share the same state
const isDark = ref(false)

// Determine the initial theme:
// 1. localStorage preference wins
// 2. Fall back to OS prefers-color-scheme
const storedTheme = localStorage.getItem('theme')
if (storedTheme === 'dark') {
  isDark.value = true
} else if (storedTheme === 'light') {
  isDark.value = false
} else {
  // No stored preference – respect the OS setting
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Apply the attribute and persist whenever isDark changes
watchEffect(() => {
  if (isDark.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

const toggleTheme = () => {
  isDark.value = !isDark.value
}

export function useTheme() {
  return {
    isDark,
    theme: readonly(isDark),
    toggleTheme
  }
}
