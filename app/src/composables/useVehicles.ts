import { ref } from 'vue'
import type { Vehicle } from '../types'
import { fetchGroups, fetchVehicles } from '../api/gpsdozor'

const vehicles = ref<Vehicle[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

let loaded = false

export function useVehicles() {
  async function load(force = false) {
    if (loaded && !force) return
    loading.value = true
    error.value = null
    try {
      const groups = await fetchGroups()
      if (groups.length === 0) throw new Error('No groups available')
      const all: Vehicle[] = []
      for (const g of groups) {
        const v = await fetchVehicles(g.code)
        all.push(...v)
      }
      vehicles.value = all
      loaded = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load vehicles'
    } finally {
      loading.value = false
    }
  }

  return { vehicles, loading, error, load }
}
