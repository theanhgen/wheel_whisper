import { ref } from 'vue'
import type { Trip, Vehicle } from '../types'
import { fetchTrips } from '../api/gpsdozor'

const trips = ref<Trip[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useTrips() {
  async function load(vehicles: Vehicle[], from: string, to: string) {
    loading.value = true
    error.value = null
    try {
      const promises = vehicles.map(async (v) => {
        try {
          return await fetchTrips(v.code, from, to, v.name)
        } catch {
          return []
        }
      })
      const results = await Promise.all(promises)
      const all: Trip[] = results.flat()
      all.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      trips.value = all
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load trips'
    } finally {
      loading.value = false
    }
  }

  function clear() {
    trips.value = []
  }

  return { trips, loading, error, load, clear }
}
