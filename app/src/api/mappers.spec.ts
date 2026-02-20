import { describe, it, expect } from 'vitest'
import { mapVehicle } from './mappers'
import type { ApiVehicle } from '../types'

describe('mappers', () => {
  describe('mapVehicle', () => {
    it('should correctly map a raw API vehicle to the app model', () => {
      const apiVehicle: ApiVehicle = {
        Code: 'V1',
        Name: 'Truck 1',
        SPZ: 'ABC-123',
        IsActive: true,
        GroupCode: 'G1',
        Speed: 60,
        Odometer: 1000,
        LastPositionTimestamp: '2026-02-19T10:00:00Z',
        IsEcoDrivingEnabled: true,
        LastPosition: {
          Latitude: '50.0',
          Longitude: '14.0'
        }
      }

      const result = mapVehicle(apiVehicle)

      expect(result).toEqual({
        code: 'V1',
        name: 'Truck 1',
        plateNumber: 'ABC-123',
        lat: 50.0,
        lng: 14.0,
        speed: 60,
        odometer: 1000,
        lastUpdate: '2026-02-19T10:00:00Z',
        isActive: true,
        groupCode: 'G1'
      })
    })

    it('should handle missing LastPosition gracefully', () => {
      const apiVehicle: Partial<ApiVehicle> = {
        Code: 'V1',
        Name: 'Truck 1'
      }

      const result = mapVehicle(apiVehicle as ApiVehicle)

      expect(result.lat).toBe(0)
      expect(result.lng).toBe(0)
    })
  })
})
