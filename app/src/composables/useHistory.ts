import { ref } from 'vue'
import type { VehicleHistory } from '../types'
import { fetchHistory } from '../api/gpsdozor'

const history = ref<VehicleHistory[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useHistory() {
  async function load(vehicleCodes: string[], from: string, to: string) {
    loading.value = true
    error.value = null
    try {
      history.value = await fetchHistory(vehicleCodes, from, to)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load history'
    } finally {
      loading.value = false
    }
  }

  function clear() {
    history.value = []
  }

  return { history, loading, error, load, clear }
}
