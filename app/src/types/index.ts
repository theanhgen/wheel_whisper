// GPS Dozor API response types (raw PascalCase from API)

export interface ApiGroup {
  Code: string
  Name: string
}

export interface ApiVehicle {
  Code: string
  GroupCode: string
  Name: string
  SPZ: string
  Speed: number
  LastPosition: { Latitude: string; Longitude: string }
  IsActive: boolean
  LastPositionTimestamp: string
  IsEcoDrivingEnabled: boolean
  Odometer: number
  BranchName?: string
}

export interface ApiTrip {
  Id: number
  StartTime: string
  FinishTime: string
  StartPosition: { Latitude: string; Longitude: string }
  FinishPosition: { Latitude: string; Longitude: string }
  StartAddress: string
  FinishAddress: string
  TotalDistance: number
  MaxSpeed: number
  AverageSpeed: number
  DriverName: string
  FuelConsumed: { Value: number; VolumeUnit: number }
  TripLength: string
  TripWaitingTime: string
  Odometer: number
  IsFinished: boolean
}

export interface ApiHistoryEntry {
  Name: string
  VehicleCode: string
  From: string
  To: string
  Positions: Array<{
    Lat: string
    Lng: string
    Time: string
    Speed: number
  }>
}

// App-level normalized types

export interface Group {
  code: string
  name: string
}

export interface Vehicle {
  code: string
  name: string
  plateNumber: string
  lat: number
  lng: number
  speed: number
  odometer: number
  lastUpdate: string
  isActive: boolean
  groupCode: string
}

export interface Trip {
  id: number
  vehicleCode: string
  vehicleName: string
  driverName: string
  startTime: string
  endTime: string
  startAddress: string
  endAddress: string
  distance: number
  maxSpeed: number
  avgSpeed: number
  fuelConsumed: number
  duration: string
  startLat: number
  startLng: number
  endLat: number
  endLng: number
}

export interface HistoryPoint {
  lat: number
  lng: number
  speed: number
  timestamp: string
}

export interface VehicleHistory {
  vehicleCode: string
  vehicleName: string
  points: HistoryPoint[]
}

export interface Weather {
  temperature: number
  windSpeed: number
  precipitation: number
  weatherCode: number
  description: string
}

export interface FilterState {
  dateFrom: string
  dateTo: string
  vehicleCodes: string[]
}
