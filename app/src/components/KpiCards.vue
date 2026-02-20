<script setup lang="ts">
import { computed } from 'vue'
import type { Vehicle, Trip } from '../types'
import {
  calculateTotalDistance,
  calculateTotalFuel,
  countActiveVehicles,
  formatMetric,
} from '../utils/metrics'

const props = defineProps<{
  vehicles: Vehicle[]
  trips: Trip[]
  baselineTrips?: Trip[]
}>()

const totalVehicles = computed(() => props.vehicles.length)
const activeVehicles = computed(() => countActiveVehicles(props.vehicles))
const totalDistance = computed(() => calculateTotalDistance(props.trips))
const totalFuel = computed(() => calculateTotalFuel(props.trips))
const totalTrips = computed(() => props.trips.length)

// Baseline for comparison
const baseDistance = computed(() => props.baselineTrips ? calculateTotalDistance(props.baselineTrips) : null)
const baseFuel = computed(() => props.baselineTrips ? calculateTotalFuel(props.baselineTrips) : null)
const baseTrips = computed(() => props.baselineTrips ? props.baselineTrips.length : null)

function delta(current: number, baseline: number | null): string | null {
  if (baseline === null || baseline === 0) return null
  const pct = ((current - baseline) / baseline) * 100
  if (Math.abs(pct) < 0.5) return null
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(0)}%`
}

function deltaClass(current: number, baseline: number | null): string {
  if (baseline === null || baseline === 0) return ''
  return current >= baseline ? 'text-green-600' : 'text-red-500'
}

const cards = computed(() => [
  { label: 'Total Vehicles', value: String(totalVehicles.value), unit: '', delta: null, deltaClass: '' },
  { label: 'Active Now', value: String(activeVehicles.value), unit: '', delta: null, deltaClass: '' },
  {
    label: 'Total Distance',
    value: formatMetric(totalDistance.value),
    unit: 'km',
    delta: delta(totalDistance.value, baseDistance.value),
    deltaClass: deltaClass(totalDistance.value, baseDistance.value),
  },
  {
    label: 'Fuel Consumed',
    value: formatMetric(totalFuel.value),
    unit: 'L',
    delta: delta(totalFuel.value, baseFuel.value),
    deltaClass: deltaClass(totalFuel.value, baseFuel.value),
  },
  {
    label: 'Total Trips',
    value: String(totalTrips.value),
    unit: '',
    delta: delta(totalTrips.value, baseTrips.value),
    deltaClass: deltaClass(totalTrips.value, baseTrips.value),
  },
])
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
    <div
      v-for="card in cards"
      :key="card.label"
      class="bg-white rounded-lg shadow p-4 text-center"
    >
      <div class="text-2xl font-bold text-gray-900">
        {{ card.value }}<span v-if="card.unit" class="text-sm font-normal text-gray-500 ml-1">{{ card.unit }}</span>
      </div>
      <div class="text-xs text-gray-500 mt-1">{{ card.label }}</div>
      <div v-if="card.delta" :class="['text-xs mt-0.5 font-medium', card.deltaClass]">
        {{ card.delta }} vs prev. period
      </div>
    </div>
  </div>
</template>
