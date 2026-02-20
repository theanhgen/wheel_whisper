<script setup lang="ts">
import type { Webcam } from '../api/windy'

defineProps<{
  webcams: Webcam[]
  loading: boolean
}>()
</script>

<template>
  <div>
    <div v-if="loading" class="text-xs text-gray-400">Loading nearby webcams...</div>
    <div v-else-if="webcams.length === 0" class="text-xs text-gray-400">No nearby webcams</div>
    <div v-else class="flex gap-2 overflow-x-auto">
      <div
        v-for="cam in webcams"
        :key="cam.webcamId"
        class="flex-shrink-0 w-[180px]"
      >
        <a :href="cam.imageUrl || cam.thumbnailUrl" target="_blank" rel="noopener noreferrer">
          <img
            :src="cam.thumbnailUrl"
            :alt="cam.title"
            class="w-full h-[100px] object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
            loading="lazy"
          />
        </a>
        <div class="text-xs text-gray-600 mt-1 truncate" :title="cam.title">
          {{ cam.title }}
        </div>
        <div class="text-xs text-gray-400">{{ cam.city }}, {{ cam.country }}</div>
      </div>
    </div>
  </div>
</template>
