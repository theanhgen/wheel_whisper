/**
 * Computes the initial bearing (forward azimuth) in degrees from point 1 to point 2.
 * Uses the Haversine-based bearing formula.
 * Returns a value in [0, 360).
 */
export function computeBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI

  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const dLambda = toRad(lng2 - lng1)

  const y = Math.sin(dLambda) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda)

  const bearing = toDeg(Math.atan2(y, x))
  return (bearing + 360) % 360
}
