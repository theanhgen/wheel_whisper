<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { ChartData } from 'chart.js'
import type { Trip } from '../types'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const props = defineProps<{
  trips: Trip[]
}>()

const chartData = computed<ChartData<'bar'>>(() => {
  // Aggregate per vehicle
  const map = new Map<string, { distance: number; fuel: number; count: number; speedSum: number }>()
  for (const t of props.trips) {
    const key = t.vehicleName || t.vehicleCode
    const prev = map.get(key) ?? { distance: 0, fuel: 0, count: 0, speedSum: 0 }
    prev.distance += Number(t.distance) || 0
    prev.fuel += Number(t.fuelConsumed) || 0
    prev.count += 1
    prev.speedSum += Number(t.avgSpeed) || 0
    map.set(key, prev)
  }

  const labels = [...map.keys()]
  const distances = labels.map((k) => map.get(k)!.distance)
  const fuels = labels.map((k) => map.get(k)!.fuel)
  const avgSpeeds = labels.map((k) => {
    const d = map.get(k)!
    return d.count > 0 ? d.speedSum / d.count : 0
  })

  return {
    labels,
    datasets: [
      {
        label: 'Distance (km)',
        data: distances,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        label: 'Fuel (L)',
        data: fuels,
        backgroundColor: 'rgba(249, 115, 22, 0.7)',
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        label: 'Avg Speed (km/h)',
        data: avgSpeeds,
        type: 'line' as const,
        borderColor: '#22c55e',
        backgroundColor: '#22c55e',
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  } as ChartData<'bar'>
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: false },
  },
  scales: {
    y: {
      type: 'linear' as const,
      position: 'left' as const,
      title: { display: true, text: 'km / L' },
    },
    y1: {
      type: 'linear' as const,
      position: 'right' as const,
      title: { display: true, text: 'km/h' },
      grid: { drawOnChartArea: false },
    },
  },
}
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4">
    <h3 class="text-sm font-semibold text-gray-700 mb-2">Trip Metrics by Vehicle</h3>
    <div class="h-[260px]">
      <Bar v-if="trips.length > 0" :data="chartData" :options="options" />
      <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
        No trip data to display
      </div>
    </div>
  </div>
</template>
