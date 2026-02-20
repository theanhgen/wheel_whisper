<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useFleetStore, useTripStore, useContextStore } from '../stores'
import FilterBar from '../components/FilterBar.vue'
import FleetMap from '../components/FleetMap.vue'
import KpiCards from '../components/KpiCards.vue'
import TripChart from '../components/TripChart.vue'
import TripTable from '../components/TripTable.vue'
import WeatherBadge from '../components/WeatherBadge.vue'
import WebcamPanel from '../components/WebcamPanel.vue'
import ApiEvidencePanel from '../components/ApiEvidencePanel.vue'
import DriverScorecard from '../components/DriverScorecard.vue'
import type { Trip } from '../types'

const fleetStore = useFleetStore()
const tripStore = useTripStore()
const contextStore = useContextStore()

const { vehicles, loading: vehiclesLoading, error: vehiclesError } = storeToRefs(fleetStore)
const { trips, baselineTrips, history, loading: tripsLoading, historyLoading, error: tripsError, filter, selectedTrip, selectedVehicleCode } = storeToRefs(tripStore)
const { weather, weatherLoading, webcams, webcamsLoading } = storeToRefs(contextStore)

async function handleSelectTrip(trip: Trip) {
  contextStore.clear()
  tripStore.selectTrip(trip)
  contextStore.loadWeather(trip.startLat, trip.startLng, trip.startTime)
  contextStore.loadWebcams(trip.endLat, trip.endLng)
}

function handleSelectVehicle(code: string) {
  tripStore.selectVehicle(code)
}

onMounted(async () => {
  await fleetStore.load()
  filter.value.vehicleCodes = vehicles.value.map((v) => v.code)
  await tripStore.applyFilter()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-gray-900">Fleet Operations Dashboard</h1>
          <p class="text-xs text-gray-500">Real-time fleet monitoring and trip analysis for logistics managers</p>
        </div>
        <div class="text-xs text-gray-400">
          GPS Dozor + Open-Meteo + Windy + OSM
        </div>
      </div>
    </header>

    <main class="max-w-screen-xl mx-auto px-4 py-4 space-y-4">
      <div v-if="vehiclesLoading" class="text-center py-12 text-gray-500">Loading fleet data...</div>
      <div v-else-if="vehiclesError" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div class="text-red-600 font-medium mb-2">Failed to load fleet data</div>
        <div class="text-red-500 text-sm mb-3">{{ vehiclesError }}</div>
        <button
          @click="fleetStore.load(true)"
          class="text-sm bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>

      <template v-else>
        <FilterBar v-model="filter" :vehicles="vehicles" @apply="tripStore.applyFilter" />

        <KpiCards :vehicles="vehicles" :trips="trips" :baseline-trips="baselineTrips" />

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2 h-[400px]">
            <FleetMap
              :vehicles="vehicles"
              :history="history"
              :selected-vehicle-code="selectedVehicleCode"
              @select-vehicle="handleSelectVehicle"
            />
          </div>

          <div class="bg-white rounded-lg shadow p-4 flex flex-col overflow-y-auto max-h-[400px]">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Trip Detail</h3>
            <template v-if="selectedTrip">
              <div class="space-y-2 text-sm flex-1">
                <div><span class="text-gray-500">Vehicle:</span> {{ selectedTrip.vehicleName }}</div>
                <div><span class="text-gray-500">Driver:</span> {{ selectedTrip.driverName || '---' }}</div>
                <div><span class="text-gray-500">From:</span> {{ selectedTrip.startAddress }}</div>
                <div><span class="text-gray-500">To:</span> {{ selectedTrip.endAddress || '(in progress)' }}</div>
                <div class="grid grid-cols-2 gap-2 pt-2">
                  <div><span class="text-gray-500">Distance:</span> {{ Number(selectedTrip.distance).toFixed(1) }} km</div>
                  <div><span class="text-gray-500">Fuel:</span> {{ Number(selectedTrip.fuelConsumed).toFixed(1) }} L</div>
                  <div><span class="text-gray-500">Max Speed:</span> {{ selectedTrip.maxSpeed }} km/h</div>
                  <div><span class="text-gray-500">Duration:</span> {{ selectedTrip.duration }}</div>
                </div>
              </div>

              <!-- Driver Scorecard -->
              <DriverScorecard
                v-if="history.length > 0 && history[0]!.points.length > 1"
                :trip="selectedTrip"
                :history-points="history[0]!.points"
                class="mt-3 pt-3 border-t border-gray-100"
              />

              <!-- Context confidence -->
              <div class="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                <span class="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">Telemetry: Live</span>
                <span :class="[
                  'text-xs px-1.5 py-0.5 rounded border',
                  weather ? 'bg-green-50 text-green-700 border-green-200' : weatherLoading ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-400 border-gray-200'
                ]">
                  Weather: {{ weather ? 'Available' : weatherLoading ? 'Loading' : 'Unavailable' }}
                </span>
                <span :class="[
                  'text-xs px-1.5 py-0.5 rounded border',
                  webcams.length > 0 ? 'bg-green-50 text-green-700 border-green-200' : webcamsLoading ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-400 border-gray-200'
                ]">
                  Webcams: {{ webcams.length > 0 ? `${webcams.length} found` : webcamsLoading ? 'Loading' : 'None nearby' }}
                </span>
              </div>
              <div class="mt-3 pt-3 border-t border-gray-100">
                <div class="text-xs text-gray-500 mb-1">Weather at departure</div>
                <WeatherBadge :weather="weather" :loading="weatherLoading" />
              </div>
              <div class="mt-3 pt-3 border-t border-gray-100">
                <div class="text-xs text-gray-500 mb-1">Nearby webcams at destination</div>
                <WebcamPanel :webcams="webcams" :loading="webcamsLoading" />
              </div>
              <div v-if="historyLoading" class="mt-2 text-xs text-gray-400">Loading route...</div>
            </template>
            <div v-else class="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a trip from the table below to see route, weather, and webcams
            </div>
          </div>
        </div>

        <TripChart :trips="trips" />

        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">
            Trips
            <span class="font-normal text-gray-400 ml-1">({{ trips.length }})</span>
            <span v-if="tripsLoading" class="text-gray-400 font-normal ml-2">Loading...</span>
            <span v-if="tripsError" class="text-red-500 font-normal ml-2">Error: {{ tripsError }}</span>
          </h3>
          <TripTable
            :trips="trips"
            :selected-trip-id="selectedTrip?.id ?? null"
            @select-trip="handleSelectTrip"
          />
        </div>

        <ApiEvidencePanel />
      </template>
    </main>
  </div>
</template>
