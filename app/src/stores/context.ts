import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Weather } from '../types'
import { fetchWeather } from '../api/openmeteo'
import { fetchNearbyWebcams, type Webcam } from '../api/windy'

export const useContextStore = defineStore('context', () => {
  const weather = ref<Weather | null>(null)
  const weatherLoading = ref(false)
  const webcams = ref<Webcam[]>([])
  const webcamsLoading = ref(false)

  async function loadWeather(lat: number, lng: number, isoTime: string) {
    weatherLoading.value = true
    weather.value = null
    try {
      const d = new Date(isoTime)
      const date = d.toISOString().slice(0, 10)
      const hour = d.getHours()
      weather.value = await fetchWeather(lat, lng, date, hour)
    } catch {
      weather.value = null
    } finally {
      weatherLoading.value = false
    }
  }

  async function loadWebcams(lat: number, lng: number) {
    webcamsLoading.value = true
    webcams.value = []
    try {
      webcams.value = await fetchNearbyWebcams(lat, lng)
    } catch {
      webcams.value = []
    } finally {
      webcamsLoading.value = false
    }
  }

  function clear() {
    weather.value = null
    webcams.value = []
  }

  return { weather, weatherLoading, webcams, webcamsLoading, loadWeather, loadWebcams, clear }
})
