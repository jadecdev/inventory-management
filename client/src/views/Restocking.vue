<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
      <p>{{ t('restocking.description') }}</p>
    </div>

    <div class="card budget-card">
      <div class="card-header">
        <h3 class="card-title">{{ t('restocking.budget') }}</h3>
        <span class="budget-display">{{ currencySymbol }}{{ budget.toLocaleString() }}</span>
      </div>
      <div class="budget-slider-wrapper">
        <span class="slider-min">{{ currencySymbol }}1,000</span>
        <input
          type="range"
          class="budget-slider"
          :min="1000"
          :max="100000"
          :step="1000"
          v-model.number="budget"
          @input="onBudgetChange"
        />
        <span class="slider-max">{{ currencySymbol }}100,000</span>
      </div>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

      <div v-if="recommendations.length === 0" class="card empty-state">
        <p>{{ t('restocking.emptyState') }}</p>
      </div>

      <div v-else>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">{{ t('restocking.recommendations') }}</h3>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>{{ t('restocking.sku') }}</th>
                  <th>{{ t('restocking.itemName') }}</th>
                  <th>{{ t('restocking.trend') }}</th>
                  <th>{{ t('restocking.forecastedDemand') }}</th>
                  <th>{{ t('restocking.unitCost') }}</th>
                  <th>{{ t('restocking.recommendedQty') }}</th>
                  <th>{{ t('restocking.lineTotal') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in recommendations" :key="item.id">
                  <td><strong>{{ item.item_sku }}</strong></td>
                  <td>{{ item.item_name }}</td>
                  <td>
                    <span :class="['badge', item.trend]">
                      {{ t(`trends.${item.trend}`) }}
                    </span>
                  </td>
                  <td>{{ item.forecasted_demand }}</td>
                  <td>{{ formatCurrency(item.unit_cost) }}</td>
                  <td>{{ item.recommended_quantity }}</td>
                  <td><strong>{{ formatCurrency(item.line_total) }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="summary-bar">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">{{ t('restocking.totalItems') }}</div>
              <div class="stat-value">{{ totalItems }}</div>
            </div>
            <div class="stat-card" :class="{ danger: totalCost > budget }">
              <div class="stat-label">{{ t('restocking.totalCost') }}</div>
              <div class="stat-value">{{ formatCurrency(totalCost) }}</div>
            </div>
            <div class="stat-card" :class="remainingBudgetClass">
              <div class="stat-label">{{ t('restocking.remainingBudget') }}</div>
              <div class="stat-value">{{ formatCurrency(remainingBudget) }}</div>
            </div>
          </div>

          <button
            class="place-order-btn"
            :disabled="submitting"
            @click="placeOrder"
          >
            {{ submitting ? t('restocking.placingOrder') : t('restocking.placeOrder') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from '../api'
import { useI18n } from '../composables/useI18n'

export default {
  name: 'Restocking',
  setup() {
    const { t, currentCurrency } = useI18n()

    const budget = ref(50000)
    const recommendations = ref([])
    const loading = ref(false)
    const error = ref(null)
    const submitting = ref(false)
    const successMessage = ref(null)

    // Debounce timer handle
    let debounceTimer = null

    const currencySymbol = computed(() => currentCurrency.value === 'JPY' ? '¥' : '$')

    const totalItems = computed(() =>
      recommendations.value.reduce((sum, item) => sum + item.recommended_quantity, 0)
    )

    const totalCost = computed(() =>
      recommendations.value.reduce((sum, item) => sum + item.line_total, 0)
    )

    const remainingBudget = computed(() => budget.value - totalCost.value)

    const remainingBudgetClass = computed(() => {
      if (remainingBudget.value < 0) return 'danger'
      if (remainingBudget.value < budget.value * 0.1) return 'warning'
      return 'success'
    })

    const formatCurrency = (value) => {
      return `${currencySymbol.value}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const loadRecommendations = async () => {
      loading.value = true
      error.value = null
      try {
        recommendations.value = await api.getRestockingRecommendations(budget.value)
      } catch (err) {
        error.value = 'Failed to load restocking recommendations: ' + err.message
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const onBudgetChange = () => {
      // Clear any pending debounce
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(() => {
        debounceTimer = null
        loadRecommendations()
      }, 300)
    }

    const placeOrder = async () => {
      if (submitting.value || recommendations.value.length === 0) return

      submitting.value = true
      error.value = null
      successMessage.value = null

      try {
        const orderData = {
          items: recommendations.value.map(item => ({
            sku: item.item_sku,
            name: item.item_name,
            quantity: item.recommended_quantity,
            unit_price: item.unit_cost
          })),
          total_value: totalCost.value
        }

        await api.submitRestockingOrder(orderData)

        successMessage.value = t('restocking.orderPlaced')
        // Reset state after successful submission
        recommendations.value = []
      } catch (err) {
        error.value = 'Failed to place order: ' + err.message
        console.error(err)
      } finally {
        submitting.value = false
      }
    }

    onMounted(loadRecommendations)

    return {
      t,
      budget,
      recommendations,
      loading,
      error,
      submitting,
      successMessage,
      currencySymbol,
      totalItems,
      totalCost,
      remainingBudget,
      remainingBudgetClass,
      formatCurrency,
      onBudgetChange,
      placeOrder
    }
  }
}
</script>

<style scoped>
.restocking {
  padding: 0;
}

.budget-card .card-header {
  margin-bottom: 0.75rem;
}

/* Amber budget display instead of blue */
.budget-display {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-accent);
  letter-spacing: -0.025em;
}

.budget-slider-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Warm slider labels */
.slider-min,
.slider-max {
  font-size: 0.813rem;
  color: #78716c;
  font-weight: 500;
  white-space: nowrap;
}

/* Slider track with warm filled-area styling */
.budget-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-border);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

/* Amber slider thumb */
.budget-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(245, 158, 11, 0.4);
  transition: box-shadow 0.15s ease;
}

.budget-slider::-webkit-slider-thumb:hover {
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.55);
}

/* Amber slider thumb for Firefox */
.budget-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 4px rgba(245, 158, 11, 0.4);
}

/* Amber filled track area for Firefox */
.budget-slider::-moz-range-progress {
  background: var(--color-accent);
  height: 6px;
  border-radius: 3px;
}

/* Warm empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1.25rem;
  color: #78716c;
  font-size: 0.938rem;
}

/* Warm summary bar border and background */
.summary-bar {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
}

.summary-bar .stats-grid {
  flex: 1;
  margin-bottom: 0;
}

/* Amber place order button */
.place-order-btn {
  padding: 0.75rem 2rem;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, opacity 0.2s ease;
  flex-shrink: 0;
}

.place-order-btn:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.place-order-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Keep success message green */
.success-message {
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  padding: 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.25rem;
  font-size: 0.938rem;
  font-weight: 500;
}

@media (max-width: 640px) {
  .summary-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .place-order-btn {
    width: 100%;
    text-align: center;
  }

  .budget-display {
    font-size: 1.25rem;
  }
}
</style>
