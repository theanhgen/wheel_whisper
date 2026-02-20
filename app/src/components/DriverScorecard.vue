<script setup lang="ts">
import { computed } from 'vue'
import type { Trip, HistoryPoint } from '../types'
import { computeDriverScore } from '../utils/scoring'

const props = defineProps<{
  trip: Trip
  historyPoints: HistoryPoint[]
}>()

const score = computed(() => computeDriverScore(props.trip, props.historyPoints))

const gradeColor = computed(() => {
  const g = score.value.grade
  if (g === 'A') return 'bg-green-100 text-green-800 border-green-300'
  if (g === 'B') return 'bg-blue-100 text-blue-800 border-blue-300'
  if (g === 'C') return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  if (g === 'D') return 'bg-orange-100 text-orange-800 border-orange-300'
  return 'bg-red-100 text-red-800 border-red-300'
})
</script>

<template>
  <div>
    <div class="text-xs text-gray-500 mb-2">Driver Scorecard</div>
    <div class="flex items-start gap-3">
      <div
        :class="[gradeColor, 'w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold shrink-0']"
      >
        {{ score.grade }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-baseline gap-2 mb-1">
          <span class="text-sm font-semibold text-gray-800">{{ score.score }}/100</span>
          <span class="text-xs text-gray-400">Efficiency: {{ score.efficiencyRating }}</span>
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">{{ score.summary }}</p>
        <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1.5 text-xs text-gray-500">
          <div>Fuel: {{ score.fuelPer100km }} L/100km</div>
          <div>Speeding: {{ score.speedingCount }}x</div>
          <div>Harsh brake: {{ score.harshBrakingCount }}x</div>
          <div>Speed var: {{ score.speedVariance }} km/h</div>
        </div>
      </div>
    </div>
  </div>
</template>
