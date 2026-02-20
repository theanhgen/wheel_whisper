import { describe, it, expect } from 'vitest'
import {
  calculateTotalDistance,
  calculateTotalFuel,
  countActiveVehicles,
} from './metrics'
import type { Trip, Vehicle } from '../types'

describe('metrics utilities', () => {
  describe('calculateTotalDistance', () => {
    it('should sum up distances from all trips', () => {
      const trips: Partial<Trip>[] = [
        { distance: 10.5 },
        { distance: 20.0 },
        { distance: 5.5 },
      ]
      const result = calculateTotalDistance(trips as Trip[])
      expect(result).toBe(36.0)
    })

    it('should handle trips with missing distance', () => {
      const trips: Partial<Trip>[] = [
        { distance: 10.0 },
        { distance: undefined },
      ]
      const result = calculateTotalDistance(trips as Trip[])
      expect(result).toBe(10.0)
    })
  })

  describe('calculateTotalFuel', () => {
    it('should sum up fuel consumption from all trips', () => {
      const trips: Partial<Trip>[] = [
        { fuelConsumed: 1.5 },
        { fuelConsumed: 2.2 },
      ]
      const result = calculateTotalFuel(trips as Trip[])
      expect(result).toBe(3.7)
    })
  })

  describe('countActiveVehicles', () => {
    it('should count vehicles with speed > 0', () => {
      const vehicles: Partial<Vehicle>[] = [
        { speed: 50 },
        { speed: 0 },
        { speed: 10 },
      ]
      const result = countActiveVehicles(vehicles as Vehicle[])
      expect(result).toBe(2)
    })

    it('should return 0 for empty list', () => {
      expect(countActiveVehicles([])).toBe(0)
    })
  })
})
