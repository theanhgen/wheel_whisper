import type { Weather } from '../types'
import { trackApiCall } from './tracker'

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
}

export async function fetchWeather(
  lat: number,
  lng: number,
  date: string,
  hour: number,
): Promise<Weather> {
  const url = `https://api.open-meteo.com/v1/forecast`
    + `?latitude=${lat}&longitude=${lng}`
    + `&hourly=temperature_2m,wind_speed_10m,precipitation,weather_code`
    + `&start_date=${date}&end_date=${date}`
    + `&timezone=auto`

  const start = performance.now()
  const res = await fetch(url)
  trackApiCall('Open-Meteo: /v1/forecast', res.status, Math.round(performance.now() - start))
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
  const data = await res.json()

  const idx = Math.min(hour, 23)
  const weatherCode = data.hourly.weather_code[idx] ?? 0

  return {
    temperature: data.hourly.temperature_2m[idx] ?? 0,
    windSpeed: data.hourly.wind_speed_10m[idx] ?? 0,
    precipitation: data.hourly.precipitation[idx] ?? 0,
    weatherCode,
    description: WMO_DESCRIPTIONS[weatherCode] ?? 'Unknown',
  }
}
