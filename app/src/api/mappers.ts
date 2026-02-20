import type {
  ApiGroup, ApiVehicle, ApiTrip, ApiHistoryEntry,
  Group, Vehicle, Trip, VehicleHistory,
} from '../types'

export function mapGroup(g: ApiGroup): Group {
  return { code: g.Code, name: g.Name }
}

export function mapVehicle(v: ApiVehicle): Vehicle {
  return {
    code: v.Code,
    name: v.Name,
    plateNumber: v.SPZ,
    lat: parseFloat(v.LastPosition?.Latitude ?? '0'),
    lng: parseFloat(v.LastPosition?.Longitude ?? '0'),
    speed: v.Speed,
    odometer: v.Odometer,
    lastUpdate: v.LastPositionTimestamp,
    isActive: v.IsActive,
    groupCode: v.GroupCode,
  }
}

export function mapTrip(t: ApiTrip, vehicleCode: string, vehicleName = ''): Trip {
  return {
    id: t.Id,
    vehicleCode,
    vehicleName,
    driverName: t.DriverName ?? '',
    startTime: t.StartTime,
    endTime: t.FinishTime,
    startAddress: t.StartAddress ?? '',
    endAddress: t.FinishAddress ?? '',
    distance: Number(t.TotalDistance) || 0,
    maxSpeed: Number(t.MaxSpeed) || 0,
    avgSpeed: Number(t.AverageSpeed) || 0,
    fuelConsumed: Number(t.FuelConsumed?.Value) || 0,
    duration: t.TripLength,
    startLat: parseFloat(t.StartPosition?.Latitude ?? '0'),
    startLng: parseFloat(t.StartPosition?.Longitude ?? '0'),
    endLat: parseFloat(t.FinishPosition?.Latitude ?? '0'),
    endLng: parseFloat(t.FinishPosition?.Longitude ?? '0'),
  }
}

export function mapHistory(h: ApiHistoryEntry): VehicleHistory {
  return {
    vehicleCode: h.VehicleCode,
    vehicleName: h.Name,
    points: h.Positions.map((p) => ({
      lat: parseFloat(p.Lat),
      lng: parseFloat(p.Lng),
      speed: p.Speed,
      timestamp: p.Time,
    })),
  }
}
