import { ref } from 'vue'
import { fetchNearbyWebcams, type Webcam } from '../api/windy'

const webcams = ref<Webcam[]>([])
const loading = ref(false)

export function useWebcams() {
  async function load(lat: number, lng: number) {
    loading.value = true
    webcams.value = []
    try {
      webcams.value = await fetchNearbyWebcams(lat, lng)
    } catch {
      webcams.value = []
    } finally {
      loading.value = false
    }
  }

  function clear() {
    webcams.value = []
  }

  return { webcams, loading, load, clear }
}
