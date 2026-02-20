export interface Webcam {
  webcamId: number
  title: string
  status: string
  imageUrl: string
  thumbnailUrl: string
  city: string
  country: string
}

import { trackApiCall } from './tracker'

const BASE = '/windy'

export async function fetchNearbyWebcams(
  lat: number,
  lng: number,
  radiusKm = 50,
  limit = 3,
): Promise<Webcam[]> {
  const url = `${BASE}/webcams`
    + `?lang=en&limit=${limit}&offset=0`
    + `&nearby=${lat}%2C${lng}%2C${radiusKm}`
    + `&include=images,location`

  const start = performance.now()
  try {
    const res = await fetch(url)
    trackApiCall('Windy: /webcams', res.status, Math.round(performance.now() - start))
    if (!res.ok) return []

    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.webcams ?? []).map((w: Record<string, any>) => ({
      webcamId: w.webcamId,
      title: w.title,
      status: w.status,
      imageUrl: w.images?.current?.preview ?? w.images?.daylight?.preview ?? '',
      thumbnailUrl: w.images?.current?.thumbnail ?? w.images?.daylight?.thumbnail ?? '',
      city: w.location?.city ?? '',
      country: w.location?.country ?? '',
    }))
  } catch {
    return []
  }
}
