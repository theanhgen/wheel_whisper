<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { ApiCallRecord } from '../api/tracker'

const calls = ref<ApiCallRecord[]>([])
const expanded = ref(false)

function onApiCall(e: Event) {
  const detail = (e as CustomEvent).detail as ApiCallRecord
  calls.value.unshift(detail)
  if (calls.value.length > 100) calls.value.length = 100
}

onMounted(() => window.addEventListener('api-call', onApiCall))
onUnmounted(() => window.removeEventListener('api-call', onApiCall))

const endpointSummary = computed(() => {
  const map = new Map<string, { calls: number; records: number; lastTime: string; lastStatus: number }>()
  for (const c of calls.value) {
    const prev = map.get(c.endpoint) ?? { calls: 0, records: 0, lastTime: '', lastStatus: 0 }
    prev.calls++
    prev.records += c.records
    if (!prev.lastTime || c.time > prev.lastTime) {
      prev.lastTime = c.time
      prev.lastStatus = c.status
    }
    map.set(c.endpoint, prev)
  }
  return [...map.entries()].map(([endpoint, data]) => ({ endpoint, ...data }))
})

const sourceStats = computed(() => {
  const map = new Map<string, { calls: number; records: number; ok: boolean }>()
  for (const c of calls.value) {
    const prev = map.get(c.source) ?? { calls: 0, records: 0, ok: true }
    prev.calls++
    prev.records += c.records
    if (c.status >= 400) prev.ok = false
    map.set(c.source, prev)
  }
  return [...map.entries()].map(([source, data]) => ({ source, ...data }))
})

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="bg-white rounded-lg shadow text-xs">
    <button
      @click="expanded = !expanded"
      class="w-full px-4 py-2.5 flex items-center justify-between text-gray-500 hover:text-gray-700"
    >
      <span class="font-semibold text-gray-700">Requirement Proof: API Usage</span>
      <span>
        {{ endpointSummary.length }} endpoints &middot;
        {{ calls.length }} total calls
        <span class="ml-1">{{ expanded ? '▲' : '▼' }}</span>
      </span>
    </button>

    <div v-if="expanded" class="px-4 pb-4 space-y-3">
      <!-- Source summary badges -->
      <div class="flex flex-wrap gap-2">
        <div
          v-for="s in sourceStats"
          :key="s.source"
          :class="[
            'px-2.5 py-1 rounded-full border text-xs',
            s.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700',
          ]"
        >
          {{ s.source }}: {{ s.calls }} calls, {{ s.records }} records
        </div>
      </div>

      <!-- Endpoint detail table -->
      <table class="w-full">
        <thead>
          <tr class="text-gray-400 font-medium border-b border-gray-100">
            <td class="pb-1">Endpoint</td>
            <td class="pb-1 text-center">Calls</td>
            <td class="pb-1 text-center">Records</td>
            <td class="pb-1 text-center">Status</td>
            <td class="pb-1 text-right">Last Fetch</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ep in endpointSummary" :key="ep.endpoint" class="border-b border-gray-50">
            <td class="py-1 text-gray-700 font-mono truncate max-w-[250px]" :title="ep.endpoint">{{ ep.endpoint }}</td>
            <td class="py-1 text-center text-gray-500">{{ ep.calls }}</td>
            <td class="py-1 text-center text-gray-500">{{ ep.records }}</td>
            <td class="py-1 text-center">
              <span :class="ep.lastStatus < 400 ? 'text-green-600' : 'text-red-600'">{{ ep.lastStatus }}</span>
            </td>
            <td class="py-1 text-right text-gray-400">{{ formatTime(ep.lastTime) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Assignment mapping -->
      <div class="pt-2 border-t border-gray-100 text-gray-500 space-y-1">
        <div class="font-semibold text-gray-600">Assignment Requirement Mapping</div>
        <div>1. <strong>3+ API endpoints</strong> -- 4 GPS Dozor endpoints (groups, vehicles, trips, history)</div>
        <div>2. <strong>Data visualization</strong> -- Trip metrics bar chart + route polylines on map</div>
        <div>3. <strong>Filtering/interaction</strong> -- Date range, vehicle selector, scenario presets, trip selection</div>
        <div>4. <strong>External APIs</strong> -- Open-Meteo (weather), Windy (webcams), Nominatim (geocoding)</div>
      </div>
    </div>
  </div>
</template>
