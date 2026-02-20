import type {
  ApiGroup, ApiVehicle, ApiTrip, ApiHistoryEntry,
  Group, Vehicle, Trip, VehicleHistory,
} from '../types'
import { mapGroup, mapVehicle, mapTrip, mapHistory } from './mappers'
import { trackApiCall } from './tracker'

const BASE = '/api'

const headers = {
  Accept: 'application/json',
}

async function get<T>(path: string, label: string): Promise<{ data: T; status: number; ms: number }> {
  const url = `${BASE}${path}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  const start = performance.now()
  try {
    const res = await fetch(url, { headers, signal: controller.signal })
    const ms = Math.round(performance.now() - start)
    if (!res.ok) {
      trackApiCall(`GPS Dozor: ${label}`, res.status, ms, 0)
      throw new Error(`API ${res.status}: ${res.statusText}`)
    }
    const text = await res.text()
    if (!text) return { data: [] as unknown as T, status: res.status, ms }
    return { data: JSON.parse(text), status: res.status, ms }
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchGroups(): Promise<Group[]> {
  const { data: raw, status, ms } = await get<ApiGroup[]>('/groups', '/groups')
  trackApiCall('GPS Dozor: /groups', status, ms, raw.length)
  return raw.map(mapGroup)
}

export async function fetchVehicles(groupCode: string): Promise<Vehicle[]> {
  const { data: raw, status, ms } = await get<ApiVehicle[]>(
    `/vehicles/group/${groupCode}`,
    '/vehicles/group/{code}',
  )
  trackApiCall('GPS Dozor: /vehicles/group/{code}', status, ms, raw.length)
  return raw.map(mapVehicle)
}

export async function fetchTrips(
  vehicleCode: string,
  from: string,
  to: string,
  vehicleName = '',
): Promise<Trip[]> {
  const { data: raw, status, ms } = await get<ApiTrip[]>(
    `/vehicle/${vehicleCode}/trips?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    '/vehicle/{code}/trips',
  )
  trackApiCall('GPS Dozor: /vehicle/{code}/trips', status, ms, raw.length)
  return raw.map((t) => mapTrip(t, vehicleCode, vehicleName))
}

export async function fetchHistory(
  vehicleCodes: string[],
  from: string,
  to: string,
): Promise<VehicleHistory[]> {
  const codes = vehicleCodes.join(',')
  const { data: raw, status, ms } = await get<ApiHistoryEntry[]>(
    `/vehicles/history/${codes}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    '/vehicles/history/{codes}',
  )
  const totalPoints = raw.reduce((s, h) => s + (h.Positions?.length ?? 0), 0)
  trackApiCall('GPS Dozor: /vehicles/history/{codes}', status, ms, totalPoints)
  return raw.map(mapHistory)
}
