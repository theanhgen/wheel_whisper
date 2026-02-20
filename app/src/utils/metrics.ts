import type { Vehicle, Trip } from '../types'

/**
 * Calculates total distance from a list of trips.
 */
export function calculateTotalDistance(trips: Trip[]): number {
  return trips.reduce((sum, trip) => sum + Number(trip.distance || 0), 0)
}

/**
 * Calculates total fuel consumed from a list of trips.
 */
export function calculateTotalFuel(trips: Trip[]): number {
  return trips.reduce((sum, trip) => sum + Number(trip.fuelConsumed || 0), 0)
}

/**
 * Counts currently active vehicles (speed > 0).
 */
export function countActiveVehicles(vehicles: Vehicle[]): number {
  return vehicles.filter((v) => v.speed > 0).length
}

/**
 * Formats a number to a fixed decimal for display.
 */
export function formatMetric(value: number, decimals = 1): string {
  return value.toFixed(decimals)
}
