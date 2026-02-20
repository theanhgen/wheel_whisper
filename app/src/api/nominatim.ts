import { trackApiCall } from './tracker'

export interface LocationInfo {
  city: string
  country: string
  displayName: string
}

const cache = new Map<string, LocationInfo>()

export async function reverseGeocode(lat: number, lng: number): Promise<LocationInfo | null> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`
  if (cache.has(key)) return cache.get(key)!

  const url = `https://nominatim.openstreetmap.org/reverse`
    + `?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=en`

  const start = performance.now()
  const res = await fetch(url, {
    headers: { 'User-Agent': 'FleetDashboard/1.0' },
  })
  trackApiCall('Nominatim: /reverse', res.status, Math.round(performance.now() - start))
  if (!res.ok) return null

  const data = await res.json()
  const info: LocationInfo = {
    city: data.address?.city || data.address?.town || data.address?.village || data.name || '',
    country: data.address?.country || '',
    displayName: data.display_name || '',
  }
  cache.set(key, info)
  return info
}
