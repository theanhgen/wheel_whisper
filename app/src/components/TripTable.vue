<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Trip } from '../types'

const props = defineProps<{
  trips: Trip[]
  selectedTripId: number | null
}>()

const emit = defineEmits<{
  selectTrip: [trip: Trip]
}>()

type SortKey = 'vehicleName' | 'driverName' | 'startTime' | 'distance' | 'maxSpeed' | 'fuelConsumed'
const sortKey = ref<SortKey>('startTime')
const sortAsc = ref(false)

function toggleSort(key: SortKey) {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else { sortKey.value = key; sortAsc.value = true }
}

const sorted = computed(() => {
  const arr = [...props.trips]
  arr.sort((a, b) => {
    let va: string | number = a[sortKey.value]
    let vb: string | number = b[sortKey.value]
    if (typeof va === 'string') { va = va.toLowerCase(); vb = String(vb).toLowerCase() }
    if (va < vb) return sortAsc.value ? -1 : 1
    if (va > vb) return sortAsc.value ? 1 : -1
    return 0
  })
  return arr
})

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const columns: { key: SortKey; label: string }[] = [
  { key: 'vehicleName', label: 'Vehicle' },
  { key: 'driverName', label: 'Driver' },
  { key: 'startTime', label: 'Start' },
  { key: 'distance', label: 'Distance' },
  { key: 'maxSpeed', label: 'Max Speed' },
  { key: 'fuelConsumed', label: 'Fuel' },
]
</script>

<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              @click="toggleSort(col.key)"
              class="px-4 py-3 cursor-pointer hover:text-gray-700 select-none"
            >
              {{ col.label }}
              <span v-if="sortKey === col.key">{{ sortAsc ? ' ↑' : ' ↓' }}</span>
            </th>
            <th class="px-4 py-3">Duration</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="sorted.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-400">No trips found for selected filters</td>
          </tr>
          <tr
            v-for="trip in sorted"
            :key="trip.id"
            @click="emit('selectTrip', trip)"
            :class="[
              'cursor-pointer hover:bg-blue-50 transition-colors',
              trip.id === selectedTripId ? 'bg-blue-50' : '',
            ]"
          >
            <td class="px-4 py-2.5 font-medium">{{ trip.vehicleName }}</td>
            <td class="px-4 py-2.5">{{ trip.driverName || '—' }}</td>
            <td class="px-4 py-2.5">{{ formatTime(trip.startTime) }}</td>
            <td class="px-4 py-2.5">{{ trip.distance.toFixed(1) }} km</td>
            <td class="px-4 py-2.5">{{ trip.maxSpeed }} km/h</td>
            <td class="px-4 py-2.5">{{ trip.fuelConsumed.toFixed(1) }} L</td>
            <td class="px-4 py-2.5 text-gray-500">{{ trip.duration }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
