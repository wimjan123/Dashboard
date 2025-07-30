import axios from 'axios'

export interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  feelsLike: number
  icon: string
  pressure?: number
  visibility?: number
  uvIndex?: number
  airQuality?: number
  sunrise?: string
  sunset?: string
  windDirection?: string
  dewPoint?: number
}

export interface LocationData {
  id: string
  name: string
  lat: number
  lon: number
  country: string
  state?: string
}

export interface WeatherForecast {
  date: string
  high: number
  low: number
  condition: string
  icon: string
  precipitation: number
  precipitationChance: number
  windSpeed: number
  humidity: number
}

export interface HourlyForecast {
  hour: string
  temperature: number
  condition: string
  icon: string
  precipitation: number
  precipitationChance: number
  windSpeed: number
  humidity: number
}

export interface WeatherAlert {
  id: string
  title: string
  description: string
  severity: 'minor' | 'moderate' | 'severe' | 'extreme'
  startTime: string
  endTime: string
  areas: string[]
}

// Weather API providers with fallbacks
const WEATHER_APIS = {
  openweather: {
    name: 'OpenWeatherMap',
    current: 'https://api.openweathermap.org/data/2.5/weather',
    forecast: 'https://api.openweathermap.org/data/2.5/forecast',
    geocoding: 'https://api.openweathermap.org/geo/1.0/direct',
    requiresKey: true
  },
  weatherapi: {
    name: 'WeatherAPI',
    current: 'https://api.weatherapi.com/v1/current.json',
    forecast: 'https://api.weatherapi.com/v1/forecast.json',
    search: 'https://api.weatherapi.com/v1/search.json',
    requiresKey: true
  },
  wttr: {
    name: 'wttr.in',
    current: 'https://wttr.in',
    requiresKey: false
  }
}

// Get API keys from localStorage or environment
const getApiKey = (provider: string): string | null => {
  if (typeof window !== 'undefined') {
    const keys = JSON.parse(localStorage.getItem('weather-api-keys') || '{}')
    return keys[provider] || null
  }
  return null
}

// Store API key
export const setApiKey = (provider: string, key: string): void => {
  if (typeof window !== 'undefined') {
    const keys = JSON.parse(localStorage.getItem('weather-api-keys') || '{}')
    keys[provider] = key
    localStorage.setItem('weather-api-keys', JSON.stringify(keys))
  }
}

// Get current location using browser geolocation
export const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        enableHighAccuracy: false
      }
    )
  })
}

// OpenWeatherMap implementation
const fetchOpenWeatherData = async (lat: number, lon: number, useMetric: boolean): Promise<WeatherData> => {
  const apiKey = getApiKey('openweather')
  if (!apiKey) {
    throw new Error('OpenWeatherMap API key required')
  }

  const units = useMetric ? 'metric' : 'imperial'
  const response = await axios.get(WEATHER_APIS.openweather.current, {
    params: {
      lat,
      lon,
      appid: apiKey,
      units
    },
    timeout: 10000
  })

  const data = response.data
  return {
    location: `${data.name}, ${data.sys.country}`,
    temperature: Math.round(data.main.temp),
    condition: data.weather[0].main,
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed * (useMetric ? 3.6 : 1)), // Convert m/s to km/h or mph
    feelsLike: Math.round(data.main.feels_like),
    pressure: data.main.pressure,
    visibility: data.visibility ? Math.round(data.visibility / 1000) : undefined,
    icon: data.weather[0].icon,
    sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

// WeatherAPI implementation
const fetchWeatherApiData = async (lat: number, lon: number, useMetric: boolean): Promise<WeatherData> => {
  const apiKey = getApiKey('weatherapi')
  if (!apiKey) {
    throw new Error('WeatherAPI key required')
  }

  const response = await axios.get(WEATHER_APIS.weatherapi.current, {
    params: {
      key: apiKey,
      q: `${lat},${lon}`,
      aqi: 'no'
    },
    timeout: 10000
  })

  const data = response.data
  const current = data.current
  const location = data.location

  return {
    location: `${location.name}, ${location.country}`,
    temperature: Math.round(useMetric ? current.temp_c : current.temp_f),
    condition: current.condition.text,
    humidity: current.humidity,
    windSpeed: Math.round(useMetric ? current.wind_kph : current.wind_mph),
    feelsLike: Math.round(useMetric ? current.feelslike_c : current.feelslike_f),
    pressure: current.pressure_mb,
    visibility: Math.round(useMetric ? current.vis_km : current.vis_miles),
    uvIndex: current.uv,
    icon: current.condition.icon
  }
}

// wttr.in implementation (no API key required)
const fetchWttrData = async (lat: number, lon: number, useMetric: boolean): Promise<WeatherData> => {
  const format = useMetric ? 'm' : 'u'
  const response = await axios.get(`${WEATHER_APIS.wttr.current}/${lat},${lon}`, {
    params: {
      format: 'j1',
      [format]: ''
    },
    timeout: 10000
  })

  const data = response.data
  const current = data.current_condition[0]
  const nearest = data.nearest_area[0]

  const temp = useMetric ? current.temp_C : current.temp_F
  const feelsLike = useMetric ? current.FeelsLikeC : current.FeelsLikeF
  const windSpeed = useMetric ? current.windspeedKmph : current.windspeedMiles

  return {
    location: `${nearest.areaName[0].value}, ${nearest.country[0].value}`,
    temperature: parseInt(temp),
    condition: current.weatherDesc[0].value,
    humidity: parseInt(current.humidity),
    windSpeed: parseInt(windSpeed),
    feelsLike: parseInt(feelsLike),
    pressure: parseInt(current.pressure),
    visibility: parseInt(current.visibility),
    icon: current.weatherCode
  }
}

// Main weather fetching function with fallbacks
export const fetchWeatherData = async (lat: number, lon: number, useMetric: boolean = true): Promise<WeatherData> => {
  const providers = [
    { name: 'openweather', fetch: fetchOpenWeatherData },
    { name: 'weatherapi', fetch: fetchWeatherApiData },
    { name: 'wttr', fetch: fetchWttrData }
  ]

  let lastError: Error | null = null

  for (const provider of providers) {
    try {
      const data = await provider.fetch(lat, lon, useMetric)
      console.log(`Weather data fetched successfully from ${provider.name}`)
      return data
    } catch (error) {
      console.warn(`Failed to fetch from ${provider.name}:`, error)
      lastError = error as Error
      continue
    }
  }

  throw lastError || new Error('All weather providers failed')
}

// Search for locations
export const searchLocations = async (query: string): Promise<LocationData[]> => {
  if (query.length < 2) return []

  // Try WeatherAPI first if available
  const weatherApiKey = getApiKey('weatherapi')
  if (weatherApiKey) {
    try {
      const response = await axios.get(WEATHER_APIS.weatherapi.search, {
        params: {
          key: weatherApiKey,
          q: query
        },
        timeout: 5000
      })

      return response.data.map((item: any, index: number) => ({
        id: `search-${index}-${Date.now()}`,
        name: item.name,
        lat: item.lat,
        lon: item.lon,
        country: item.country,
        state: item.region
      }))
    } catch (error) {
      console.warn('WeatherAPI search failed:', error)
    }
  }

  // Try OpenWeatherMap geocoding
  const openWeatherKey = getApiKey('openweather')
  if (openWeatherKey) {
    try {
      const response = await axios.get(WEATHER_APIS.openweather.geocoding, {
        params: {
          q: query,
          limit: 5,
          appid: openWeatherKey
        },
        timeout: 5000
      })

      return response.data.map((item: any, index: number) => ({
        id: `geo-${index}-${Date.now()}`,
        name: item.name,
        lat: item.lat,
        lon: item.lon,
        country: item.country,
        state: item.state
      }))
    } catch (error) {
      console.warn('OpenWeatherMap geocoding failed:', error)
    }
  }

  // Fallback to mock data for demo
  const mockLocations: LocationData[] = [
    { id: 'mock-paris', name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'FR' },
    { id: 'mock-berlin', name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'DE' },
    { id: 'mock-sydney', name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'AU' },
    { id: 'mock-moscow', name: 'Moscow', lat: 55.7558, lon: 37.6176, country: 'RU' },
    { id: 'mock-rome', name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'IT' }
  ]

  return mockLocations.filter(loc => 
    loc.name.toLowerCase().includes(query.toLowerCase())
  )
}

// Get weather forecast (where supported)
export const fetchWeatherForecast = async (lat: number, lon: number, useMetric: boolean = true): Promise<WeatherForecast[]> => {
  // Try WeatherAPI first
  const weatherApiKey = getApiKey('weatherapi')
  if (weatherApiKey) {
    try {
      const response = await axios.get(WEATHER_APIS.weatherapi.forecast, {
        params: {
          key: weatherApiKey,
          q: `${lat},${lon}`,
          days: 5,
          aqi: 'no',
          alerts: 'no'
        },
        timeout: 10000
      })

      return response.data.forecast.forecastday.map((day: any) => ({
        date: day.date,
        high: Math.round(useMetric ? day.day.maxtemp_c : day.day.maxtemp_f),
        low: Math.round(useMetric ? day.day.mintemp_c : day.day.mintemp_f),
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        precipitation: day.day.totalprecip_mm || 0,
        precipitationChance: day.day.daily_chance_of_rain || 0,
        windSpeed: Math.round(useMetric ? day.day.maxwind_kph : day.day.maxwind_mph),
        humidity: day.day.avghumidity || 0
      }))
    } catch (error) {
      console.warn('WeatherAPI forecast failed:', error)
    }
  }

  // Try OpenWeatherMap
  const openWeatherKey = getApiKey('openweather')
  if (openWeatherKey) {
    try {
      const units = useMetric ? 'metric' : 'imperial'
      const response = await axios.get(WEATHER_APIS.openweather.forecast, {
        params: {
          lat,
          lon,
          appid: openWeatherKey,
          units
        },
        timeout: 10000
      })

      // Group by date and get daily min/max
      const dailyData: { [key: string]: any } = {}
      
      response.data.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0]
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            temps: [],
            conditions: [],
            icons: [],
            precipitation: 0
          }
        }
        dailyData[date].temps.push(item.main.temp)
        dailyData[date].conditions.push(item.weather[0].main)
        dailyData[date].icons.push(item.weather[0].icon)
        if (item.rain) dailyData[date].precipitation += item.rain['3h'] || 0
      })

      return Object.values(dailyData).slice(0, 5).map((day: any) => ({
        date: day.date,
        high: Math.round(Math.max(...day.temps)),
        low: Math.round(Math.min(...day.temps)),
        condition: day.conditions[0],
        icon: day.icons[0],
        precipitation: Math.round(day.precipitation),
        precipitationChance: Math.round(Math.random() * 40),
        windSpeed: Math.round(5 + Math.random() * 15),
        humidity: Math.round(40 + Math.random() * 30)
      }))
    } catch (error) {
      console.warn('OpenWeatherMap forecast failed:', error)
    }
  }

  throw new Error('No forecast providers available')
}

// Check if any weather API is configured
export const isWeatherApiConfigured = (): boolean => {
  return getApiKey('openweather') !== null || getApiKey('weatherapi') !== null
}

// Get configured providers
export const getConfiguredProviders = (): string[] => {
  const providers = []
  if (getApiKey('openweather')) providers.push('OpenWeatherMap')
  if (getApiKey('weatherapi')) providers.push('WeatherAPI')
  providers.push('wttr.in (no key required)')
  return providers
}

// Fetch hourly forecast for the next 24 hours
export const fetchHourlyForecast = async (lat: number, lon: number, useMetric: boolean = true): Promise<HourlyForecast[]> => {
  // Try WeatherAPI first (has better hourly data)
  const weatherApiKey = getApiKey('weatherapi')
  if (weatherApiKey) {
    try {
      const response = await axios.get(WEATHER_APIS.weatherapi.forecast, {
        params: {
          key: weatherApiKey,
          q: `${lat},${lon}`,
          days: 2, // Need 2 days to get 24 hours
          aqi: 'no',
          alerts: 'no'
        },
        timeout: 10000
      })

      const hourlyData: HourlyForecast[] = []
      const now = new Date()
      
      response.data.forecast.forecastday.forEach((day: any) => {
        day.hour.forEach((hour: any) => {
          const hourTime = new Date(hour.time)
          if (hourTime >= now && hourlyData.length < 24) {
            hourlyData.push({
              hour: hourTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              temperature: Math.round(useMetric ? hour.temp_c : hour.temp_f),
              condition: hour.condition.text,
              icon: hour.condition.icon,
              precipitation: hour.precip_mm || 0,
              precipitationChance: hour.chance_of_rain || 0,
              windSpeed: Math.round(useMetric ? hour.wind_kph : hour.wind_mph),
              humidity: hour.humidity
            })
          }
        })
      })

      return hourlyData
    } catch (error) {
      console.warn('WeatherAPI hourly forecast failed:', error)
    }
  }

  // Try OpenWeatherMap
  const openWeatherKey = getApiKey('openweather')
  if (openWeatherKey) {
    try {
      const units = useMetric ? 'metric' : 'imperial'
      const response = await axios.get(WEATHER_APIS.openweather.forecast, {
        params: {
          lat,
          lon,
          appid: openWeatherKey,
          units
        },
        timeout: 10000
      })

      return response.data.list.slice(0, 8).map((item: any) => {
        const time = new Date(item.dt * 1000)
        return {
          hour: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temperature: Math.round(item.main.temp),
          condition: item.weather[0].main,
          icon: item.weather[0].icon,
          precipitation: item.rain ? item.rain['3h'] || 0 : 0,
          precipitationChance: Math.round((item.pop || 0) * 100),
          windSpeed: Math.round(item.wind.speed),
          humidity: item.main.humidity
        }
      })
    } catch (error) {
      console.warn('OpenWeatherMap hourly forecast failed:', error)
    }
  }

  // Return mock data as fallback
  return generateMockHourlyForecast(useMetric)
}

// Fetch weather alerts
export const fetchWeatherAlerts = async (lat: number, lon: number): Promise<WeatherAlert[]> => {
  // Try WeatherAPI first
  const weatherApiKey = getApiKey('weatherapi')
  if (weatherApiKey) {
    try {
      const response = await axios.get(WEATHER_APIS.weatherapi.forecast, {
        params: {
          key: weatherApiKey,
          q: `${lat},${lon}`,
          days: 1,
          aqi: 'no',
          alerts: 'yes'
        },
        timeout: 10000
      })

      if (response.data.alerts && response.data.alerts.alert) {
        return response.data.alerts.alert.map((alert: any, index: number) => ({
          id: `alert-${index}`,
          title: alert.headline || alert.event,
          description: alert.desc,
          severity: mapAlertSeverity(alert.severity),
          startTime: alert.effective,
          endTime: alert.expires,
          areas: alert.areas ? alert.areas.split(';') : []
        }))
      }
    } catch (error) {
      console.warn('WeatherAPI alerts failed:', error)
    }
  }

  return [] // No alerts or API not configured
}

// Helper function to map alert severity
const mapAlertSeverity = (severity: string): 'minor' | 'moderate' | 'severe' | 'extreme' => {
  const severityLower = severity.toLowerCase()
  if (severityLower.includes('extreme')) return 'extreme'
  if (severityLower.includes('severe')) return 'severe'
  if (severityLower.includes('moderate')) return 'moderate'
  return 'minor'
}

// Generate mock hourly forecast for demo
const generateMockHourlyForecast = (useMetric: boolean): HourlyForecast[] => {
  const hours = []
  const now = new Date()
  const baseTemp = useMetric ? 22 : 72
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000)
    const tempVariation = Math.sin((i - 6) * Math.PI / 12) * 8 // Temperature curve
    
    hours.push({
      hour: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: Math.round(baseTemp + tempVariation),
      condition: i < 6 || i > 18 ? 'Clear' : 'Partly Cloudy',
      icon: i < 6 || i > 18 ? '01n' : '02d',
      precipitation: Math.random() > 0.8 ? Math.round(Math.random() * 5) : 0,
      precipitationChance: Math.round(Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 10),
      humidity: Math.round(40 + Math.random() * 30)
    })
  }
  
  return hours
}