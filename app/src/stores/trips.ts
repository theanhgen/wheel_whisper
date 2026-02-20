import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { FilterState, Trip, Vehicle, VehicleHistory } from '../types'
import { fetchTrips, fetchHistory } from '../api/gpsdozor'
import { useFleetStore } from './fleet'

export const useTripStore = defineStore('trips', () => {
  const trips = ref<Trip[]>([])
  const baselineTrips = ref<Trip[]>([])
  const history = ref<VehicleHistory[]>([])
  const loading = ref(false)
  const historyLoading = ref(false)
  const error = ref<string | null>(null)

  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const filter = ref<FilterState>({
    dateFrom: yesterday.toISOString().slice(0, 10),
    dateTo: yesterday.toISOString().slice(0, 10),
    vehicleCodes: [],
  })

  const selectedVehicleCode = ref<string | null>(null)
  const selectedTrip = ref<Trip | null>(null)

  const selectedVehicles = computed(() => {
    const fleet = useFleetStore()
    if (filter.value.vehicleCodes.length === 0) return fleet.vehicles
    return fleet.vehicles.filter((v) => filter.value.vehicleCodes.includes(v.code))
  })

  async function loadTrips(vehicles: Vehicle[], from: string, to: string) {
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

  async function loadBaseline(vList: Vehicle[], fromDate: string, toDate: string) {
    const fromMs = new Date(fromDate + 'T00:00:00').getTime()
    const toMs = new Date(toDate + 'T23:59:59').getTime()
    const durationMs = toMs - fromMs
    const prevFrom = new Date(fromMs - durationMs - 1000).toISOString()
    const prevTo = new Date(fromMs - 1000).toISOString()

    try {
      const results = await Promise.all(
        vList.map(async (v) => {
          try { return await fetchTrips(v.code, prevFrom, prevTo, v.name) }
          catch { return [] }
        }),
      )
      baselineTrips.value = results.flat()
    } catch {
      baselineTrips.value = []
    }
  }

  async function loadHistoryData(vehicleCodes: string[], from: string, to: string) {
    historyLoading.value = true
    try {
      history.value = await fetchHistory(vehicleCodes, from, to)
    } catch {
      history.value = []
    } finally {
      historyLoading.value = false
    }
  }

  async function applyFilter() {
    selectedTrip.value = null
    history.value = []

    const vList = selectedVehicles.value
    if (vList.length === 0) return

    const from = new Date(filter.value.dateFrom + 'T00:00:00').toISOString()
    const to = new Date(filter.value.dateTo + 'T23:59:59').toISOString()

    await Promise.all([
      loadTrips(vList, from, to),
      loadBaseline(vList, filter.value.dateFrom, filter.value.dateTo),
    ])
  }

  async function selectTrip(trip: Trip) {
    selectedTrip.value = trip
    selectedVehicleCode.value = trip.vehicleCode

    await loadHistoryData(
      [trip.vehicleCode],
      new Date(trip.startTime).toISOString(),
      new Date(trip.endTime).toISOString(),
    )
  }

  function selectVehicle(code: string) {
    selectedVehicleCode.value = code
  }

  function clearHistory() {
    history.value = []
  }

  return {
    trips,
    baselineTrips,
    history,
    loading,
    historyLoading,
    error,
    filter,
    selectedVehicleCode,
    selectedTrip,
    selectedVehicles,
    applyFilter,
    selectTrip,
    selectVehicle,
    clearHistory,
    loadHistoryData,
  }
})
