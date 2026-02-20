import { describe, it, expect } from 'vitest'
import { computeBearing } from './bearing'

describe('computeBearing', () => {
  it('returns 0 for due north', () => {
    const bearing = computeBearing(50, 14, 51, 14)
    expect(bearing).toBeCloseTo(0, 0)
  })

  it('returns ~90 for due east', () => {
    const bearing = computeBearing(0, 14, 0, 15)
    expect(bearing).toBeCloseTo(90, 0)
  })

  it('returns ~180 for due south', () => {
    const bearing = computeBearing(51, 14, 50, 14)
    expect(bearing).toBeCloseTo(180, 0)
  })

  it('returns ~270 for due west', () => {
    const bearing = computeBearing(0, 15, 0, 14)
    expect(bearing).toBeCloseTo(270, 0)
  })

  it('returns value in [0, 360)', () => {
    const bearing = computeBearing(50, 14, 49.5, 13.5)
    expect(bearing).toBeGreaterThanOrEqual(0)
    expect(bearing).toBeLessThan(360)
  })
})
