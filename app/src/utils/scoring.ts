import type { Trip, HistoryPoint } from '../types'

export interface DriverScore {
  grade: string
  score: number
  efficiencyRating: string
  fuelPer100km: number
  speedingCount: number
  harshBrakingCount: number
  speedVariance: number
  summary: string
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function letterGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

function efficiencyGrade(fuelPer100km: number): string {
  if (fuelPer100km <= 6) return 'A+'
  if (fuelPer100km <= 8) return 'A'
  if (fuelPer100km <= 10) return 'B+'
  if (fuelPer100km <= 12) return 'B'
  if (fuelPer100km <= 14) return 'B-'
  if (fuelPer100km <= 15) return 'C'
  return 'D'
}

export function computeDriverScore(trip: Trip, points: HistoryPoint[]): DriverScore {
  const distance = Number(trip.distance) || 0
  const fuel = Number(trip.fuelConsumed) || 0

  // Fuel efficiency (30 pts): L/100km vs benchmarks
  const fuelPer100km = distance > 0 ? (fuel / distance) * 100 : 0
  // Linear scale: <=8 → 30pts, >=15 → 0pts
  const fuelScore = clamp(30 - ((fuelPer100km - 8) / 7) * 30, 0, 30)

  // Speeding (30 pts): % of points above 130 km/h
  const speedingCount = points.filter((p) => p.speed > 130).length
  const speedingPct = points.length > 0 ? speedingCount / points.length : 0
  // 0% speeding → 30pts, 20%+ → 0pts
  const speedScore = clamp(30 - (speedingPct / 0.2) * 30, 0, 30)

  // Harsh braking (20 pts): consecutive points with speed drop >= 30 km/h
  let harshBrakingCount = 0
  for (let i = 1; i < points.length; i++) {
    if (points[i - 1]!.speed - points[i]!.speed >= 30) {
      harshBrakingCount++
    }
  }
  // 0 events → 20pts, 5+ events → 0pts
  const brakingScore = clamp(20 - (harshBrakingCount / 5) * 20, 0, 20)

  // Speed consistency (20 pts): standard deviation of speeds
  const speeds = points.map((p) => p.speed).filter((s) => s > 0)
  let speedVariance = 0
  if (speeds.length > 1) {
    const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length
    const variance = speeds.reduce((sum, s) => sum + (s - mean) ** 2, 0) / speeds.length
    speedVariance = Math.sqrt(variance)
  }
  // stddev <=10 → 20pts, >=40 → 0pts
  const consistencyScore = clamp(20 - ((speedVariance - 10) / 30) * 20, 0, 20)

  const score = Math.round(fuelScore + speedScore + brakingScore + consistencyScore)
  const grade = letterGrade(score)
  const eff = efficiencyGrade(fuelPer100km)

  const parts: string[] = []
  parts.push(`Efficiency Rating: ${eff}.`)
  if (fuelPer100km > 0) {
    parts.push(fuelPer100km <= 10 ? 'Good fuel economy.' : fuelPer100km <= 14 ? 'Moderate fuel usage.' : 'High fuel consumption.')
  }
  if (speedingCount > 0) parts.push(`${speedingCount} speeding instance${speedingCount > 1 ? 's' : ''} detected.`)
  else parts.push('No speeding detected.')
  if (harshBrakingCount > 0) parts.push(`${harshBrakingCount} harsh braking event${harshBrakingCount > 1 ? 's' : ''}.`)
  else parts.push('Smooth braking.')
  if (speedVariance <= 15) parts.push('Consistent driving speed.')
  else if (speedVariance <= 30) parts.push('Moderate speed variation.')
  else parts.push('High speed variation.')

  return {
    grade,
    score,
    efficiencyRating: eff,
    fuelPer100km: Math.round(fuelPer100km * 10) / 10,
    speedingCount,
    harshBrakingCount,
    speedVariance: Math.round(speedVariance * 10) / 10,
    summary: parts.join(' '),
  }
}
