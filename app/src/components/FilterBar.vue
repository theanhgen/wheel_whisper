<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Vehicle, FilterState } from '../types'

const props = defineProps<{
  vehicles: Vehicle[]
  modelValue: FilterState
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FilterState]
  apply: []
}>()

const dateFrom = ref(props.modelValue.dateFrom)
const dateTo = ref(props.modelValue.dateTo)
const selectedCodes = ref<string[]>([...props.modelValue.vehicleCodes])
const activePreset = ref<string | null>(null)

watch(() => props.modelValue, (v) => {
  dateFrom.value = v.dateFrom
  dateTo.value = v.dateTo
  selectedCodes.value = [...v.vehicleCodes]
}, { deep: true })

function toggleVehicle(code: string) {
  const idx = selectedCodes.value.indexOf(code)
  if (idx >= 0) selectedCodes.value.splice(idx, 1)
  else selectedCodes.value.push(code)
}

function selectAll() {
  selectedCodes.value = props.vehicles.map((v) => v.code)
}

function selectNone() {
  selectedCodes.value = []
}

function apply() {
  activePreset.value = null
  emit('update:modelValue', {
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    vehicleCodes: [...selectedCodes.value],
  })
  emit('apply')
}

// --- Scenario Presets ---
function dateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

function applyPreset(preset: string) {
  const now = new Date()
  const allCodes = props.vehicles.map((v) => v.code)

  switch (preset) {
    case 'today': {
      dateFrom.value = dateStr(now)
      dateTo.value = dateStr(now)
      selectedCodes.value = [...allCodes]
      break
    }
    case 'yesterday': {
      const yd = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      dateFrom.value = dateStr(yd)
      dateTo.value = dateStr(yd)
      selectedCodes.value = [...allCodes]
      break
    }
    case 'week': {
      const wa = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFrom.value = dateStr(wa)
      dateTo.value = dateStr(now)
      selectedCodes.value = [...allCodes]
      break
    }
    case 'active': {
      dateFrom.value = dateStr(now)
      dateTo.value = dateStr(now)
      selectedCodes.value = props.vehicles.filter((v) => v.speed > 0).map((v) => v.code)
      break
    }
    case 'idle': {
      dateFrom.value = dateStr(now)
      dateTo.value = dateStr(now)
      selectedCodes.value = props.vehicles.filter((v) => v.speed === 0).map((v) => v.code)
      break
    }
  }
  activePreset.value = preset
  emit('update:modelValue', {
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    vehicleCodes: [...selectedCodes.value],
  })
  emit('apply')
}

const presets = [
  { key: 'yesterday', label: 'Yesterday', desc: 'Full day of completed trips' },
  { key: 'today', label: 'Today', desc: 'Trips so far today' },
  { key: 'week', label: 'Last 7 days', desc: 'Weekly overview' },
  { key: 'active', label: 'Active now', desc: 'Currently moving vehicles' },
  { key: 'idle', label: 'Idle vehicles', desc: 'Stationary vehicles' },
]
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4 space-y-3">
    <!-- Preset buttons -->
    <div class="flex flex-wrap gap-1.5">
      <span class="text-xs text-gray-400 self-center mr-1">Quick:</span>
      <button
        v-for="p in presets"
        :key="p.key"
        @click="applyPreset(p.key)"
        :class="[
          'text-xs px-2.5 py-1 rounded border transition-colors',
          activePreset === p.key
            ? 'bg-blue-600 text-white border-blue-600'
            : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300',
        ]"
      >
        {{ p.label }}
      </button>
    </div>

    <!-- Manual filters -->
    <div class="flex flex-wrap items-end gap-4">
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">From</label>
        <input
          v-model="dateFrom"
          type="date"
          class="border border-gray-300 rounded px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">To</label>
        <input
          v-model="dateTo"
          type="date"
          class="border border-gray-300 rounded px-2 py-1.5 text-sm"
        />
      </div>
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-medium text-gray-500 mb-1">
          Vehicles
          <button @click="selectAll" class="text-blue-600 ml-2 hover:underline">All</button>
          <button @click="selectNone" class="text-blue-600 ml-1 hover:underline">None</button>
        </label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="v in vehicles"
            :key="v.code"
            @click="toggleVehicle(v.code)"
            :class="[
              'text-xs px-2 py-1 rounded-full border transition-colors',
              selectedCodes.includes(v.code)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400',
            ]"
          >
            {{ v.name }}
          </button>
        </div>
      </div>
      <button
        @click="apply"
        class="bg-blue-600 text-white px-5 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Apply
      </button>
    </div>
  </div>
</template>
