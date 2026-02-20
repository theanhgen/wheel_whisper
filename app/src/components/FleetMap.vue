<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Vehicle, VehicleHistory } from '../types'
import { reverseGeocode } from '../api/nominatim'

const props = defineProps<{
  vehicles: Vehicle[]
  history: VehicleHistory[]
  selectedVehicleCode: string | null
}>()

const emit = defineEmits<{
  selectVehicle: [code: string]
}>()

const mapContainer = ref<HTMLDivElement>()
const showLegend = ref(false)
let map: L.Map | null = null
let markerGroup: L.LayerGroup | null = null
let routeGroup: L.LayerGroup | null = null

function truckSvg(color: string, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 3h15v13H1z"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>`
}

function createIcon(moving: boolean, selected: boolean) {
  const color = selected ? '#3b82f6' : moving ? '#22c55e' : '#9ca3af'
  const size = selected ? 28 : 24
  return L.divIcon({
    className: '',
    html: `<div style="
      filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3));
      display:flex;align-items:center;justify-content:center;
    ">${truckSvg(color, size)}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function updateMarkers() {
  if (!map || !markerGroup) return
  markerGroup.clearLayers()

  for (const v of props.vehicles) {
    if (!v.lat || !v.lng) continue
    const selected = v.code === props.selectedVehicleCode
    const marker = L.marker([v.lat, v.lng], {
      icon: createIcon(v.speed > 0, selected),
      zIndexOffset: selected ? 1000 : 0,
    })

    const popupContent = `
      <strong>${v.name}</strong><br/>
      ${v.plateNumber}<br/>
      Speed: ${v.speed} km/h<br/>
      <span id="loc-${v.code}">Loading location...</span>
    `
    marker.bindPopup(popupContent)

    marker.on('click', () => {
      emit('selectVehicle', v.code)
      reverseGeocode(v.lat, v.lng).then((loc) => {
        const el = document.getElementById(`loc-${v.code}`)
        if (el && loc) {
          el.textContent = `${loc.city}, ${loc.country}`
        } else if (el) {
          el.textContent = `${v.lat.toFixed(3)}, ${v.lng.toFixed(3)}`
        }
      })
    })

    markerGroup.addLayer(marker)
  }
}

function speedColor(speed: number): string {
  if (speed > 130) return '#ef4444'
  if (speed >= 90) return '#eab308'
  return '#22c55e'
}

function updateRoutes() {
  if (!map || !routeGroup) return
  routeGroup.clearLayers()

  let hasRoute = false

  for (const h of props.history) {
    if (h.points.length < 2) continue
    hasRoute = true

    // Draw per-segment polylines colored by speed
    for (let i = 0; i < h.points.length - 1; i++) {
      const p1 = h.points[i]!
      const p2 = h.points[i + 1]!
      const segment = L.polyline(
        [[p1.lat, p1.lng], [p2.lat, p2.lng]],
        {
          color: speedColor(p1.speed),
          weight: 3,
          opacity: 0.8,
        },
      )
      routeGroup.addLayer(segment)
    }
  }

  showLegend.value = hasRoute

  const firstHistory = props.history[0]
  if (firstHistory && firstHistory.points.length > 0) {
    const pts = firstHistory.points
    const bounds = L.latLngBounds(pts.map((p) => [p.lat, p.lng] as L.LatLngTuple))
    map.fitBounds(bounds, { padding: [30, 30] })
  }
}

onMounted(() => {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value).setView([49.0, 15.0], 5)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map)

  markerGroup = L.layerGroup().addTo(map)
  routeGroup = L.layerGroup().addTo(map)

  nextTick(() => {
    updateMarkers()
    if (props.vehicles.length > 0) {
      const bounds = L.latLngBounds(
        props.vehicles.filter((v) => v.lat && v.lng).map((v) => [v.lat, v.lng] as L.LatLngTuple),
      )
      if (bounds.isValid()) map!.fitBounds(bounds, { padding: [30, 30] })
    }
  })
})

onUnmounted(() => {
  map?.remove()
  map = null
})

watch(() => props.vehicles, updateMarkers, { deep: true })
watch(() => props.selectedVehicleCode, updateMarkers)
watch(() => props.history, updateRoutes, { deep: true })
</script>

<template>
  <div class="relative w-full h-full min-h-[300px]">
    <div ref="mapContainer" class="w-full h-full rounded-lg"></div>
    <!-- Speed legend -->
    <div
      v-if="showLegend"
      class="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 text-xs"
    >
      <div class="font-semibold text-gray-700 mb-1">Speed</div>
      <div class="flex flex-col gap-0.5">
        <div class="flex items-center gap-1.5">
          <span class="w-4 h-0.5 rounded" style="background:#22c55e"></span>
          <span class="text-gray-600">&lt; 90 km/h</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-4 h-0.5 rounded" style="background:#eab308"></span>
          <span class="text-gray-600">90-130 km/h</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-4 h-0.5 rounded" style="background:#ef4444"></span>
          <span class="text-gray-600">&gt; 130 km/h</span>
        </div>
      </div>
    </div>
  </div>
</template>
