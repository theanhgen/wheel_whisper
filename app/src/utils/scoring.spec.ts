import { describe, it, expect } from 'vitest'
import { computeDriverScore, type DriverScore } from './scoring'
import type { Trip, HistoryPoint } from '../types'

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 1,
    vehicleCode: 'V1',
    vehicleName: 'Truck 1',
    driverName: 'Driver',
    startTime: '2025-01-15T08:00:00',
    endTime: '2025-01-15T10:00:00',
    startAddress: 'A',
    endAddress: 'B',
    distance: 100,
    maxSpeed: 120,
    avgSpeed: 80,
    fuelConsumed: 8,
    duration: '2:00',
    startLat: 50,
    startLng: 14,
    endLat: 51,
    endLng: 15,
    ...overrides,
  }
}

function makePoints(speeds: number[]): HistoryPoint[] {
  return speeds.map((speed, i) => ({
    lat: 50 + i * 0.01,
    lng: 14 + i * 0.01,
    speed,
    timestamp: `2025-01-15T08:${String(i).padStart(2, '0')}:00`,
  }))
}

describe('computeDriverScore', () => {
  it('scores a perfect trip highly', () => {
    const trip = makeTrip({ distance: 100, fuelConsumed: 7 })
    const points = makePoints([80, 82, 78, 80, 81, 79, 80, 82, 78, 80])
    const score = computeDriverScore(trip, points)

    expect(score.grade).toBe('A')
    expect(score.score).toBeGreaterThanOrEqual(90)
    expect(score.speedingCount).toBe(0)
    expect(score.harshBrakingCount).toBe(0)
    expect(score.fuelPer100km).toBe(7)
    expect(score.summary).toContain('No speeding')
    expect(score.summary).toContain('Smooth braking')
  })

  it('penalizes speeding and harsh braking', () => {
    const trip = makeTrip({ distance: 100, fuelConsumed: 14 })
    // Half the points are speeding, and we have harsh braking events
    const points = makePoints([80, 140, 100, 140, 100, 140, 100, 140, 100, 80])
    const score = computeDriverScore(trip, points)

    expect(score.grade).not.toBe('A')
    expect(score.speedingCount).toBe(4)
    expect(score.harshBrakingCount).toBeGreaterThan(0)
    expect(score.score).toBeLessThan(70)
    expect(score.summary).toContain('speeding')
  })

  it('handles very poor driving with F grade', () => {
    const trip = makeTrip({ distance: 50, fuelConsumed: 15 })
    // All speeding, harsh braking, high variance
    const points = makePoints([140, 50, 140, 50, 140, 50, 140, 50, 140, 50])
    const score = computeDriverScore(trip, points)

    expect(score.grade).toBe('F')
    expect(score.score).toBeLessThan(60)
    expect(score.speedingCount).toBe(5)
    expect(score.harshBrakingCount).toBeGreaterThanOrEqual(4)
  })

  it('handles zero distance gracefully', () => {
    const trip = makeTrip({ distance: 0, fuelConsumed: 0 })
    const points = makePoints([0, 0, 0])
    const score = computeDriverScore(trip, points)

    expect(score.fuelPer100km).toBe(0)
    expect(typeof score.grade).toBe('string')
    expect(score.score).toBeGreaterThanOrEqual(0)
    expect(score.score).toBeLessThanOrEqual(100)
  })
})
