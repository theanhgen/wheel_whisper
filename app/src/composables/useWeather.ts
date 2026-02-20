import { ref } from 'vue'
import type { Weather } from '../types'
import { fetchWeather } from '../api/openmeteo'

const weather = ref<Weather | null>(null)
const loading = ref(false)

export function useWeather() {
  async function load(lat: number, lng: number, isoTime: string) {
    loading.value = true
    weather.value = null
    try {
      const d = new Date(isoTime)
      const date = d.toISOString().slice(0, 10)
      const hour = d.getHours()
      weather.value = await fetchWeather(lat, lng, date, hour)
    } catch {
      weather.value = null
    } finally {
      loading.value = false
    }
  }

  function clear() {
    weather.value = null
  }

  return { weather, loading, load, clear }
}
