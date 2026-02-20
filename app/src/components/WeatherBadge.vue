<script setup lang="ts">
import type { Weather } from '../types'

defineProps<{
  weather: Weather | null
  loading: boolean
}>()

function weatherIcon(code: number): string {
  if (code === 0) return '☀'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫'
  if (code <= 55) return '🌦'
  if (code <= 65) return '🌧'
  if (code <= 75) return '🌨'
  if (code <= 82) return '🌧'
  if (code <= 86) return '🌨'
  return '⛈'
}
</script>

<template>
  <div v-if="loading" class="text-xs text-gray-400 px-3 py-2">Loading weather...</div>
  <div
    v-else-if="weather"
    class="inline-flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 text-sm"
  >
    <span class="text-lg">{{ weatherIcon(weather.weatherCode) }}</span>
    <div>
      <span class="font-medium">{{ weather.temperature.toFixed(0) }}°C</span>
      <span class="text-gray-500 ml-2">{{ weather.description }}</span>
      <span class="text-gray-400 ml-2">{{ weather.windSpeed.toFixed(0) }} km/h wind</span>
      <span v-if="weather.precipitation > 0" class="text-blue-500 ml-2">
        {{ weather.precipitation.toFixed(1) }}mm
      </span>
    </div>
  </div>
</template>
