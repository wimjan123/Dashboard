import React, { useState, useEffect } from 'react'
import { Sun, Cloud, CloudRain, Wind, Droplets, Thermometer, Settings, MapPin, Search, Plus, X, Key, RefreshCw, Navigation } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { 
  fetchWeatherData, 
  fetchWeatherForecast,
  fetchHourlyForecast,
  fetchWeatherAlerts,
  searchLocations as apiSearchLocations, 
  getCurrentLocation as getGeoLocation,
  setApiKey,
  isWeatherApiConfigured,
  WeatherData,
  WeatherForecast,
  HourlyForecast,
  WeatherAlert,
  LocationData
} from '../utils/weatherApi'

interface SavedLocation {
  id: string
  name: string
  lat: number
  lon: number
  country: string
  state?: string
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<WeatherForecast[]>([])
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([])
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showExtended, setShowExtended] = useLocalStorage<boolean>('weather-show-extended', true)
  const [savedLocations, setSavedLocations] = useLocalStorage<SavedLocation[]>('weather-locations', [])
  const [currentLocationId, setCurrentLocationId] = useLocalStorage<string>('weather-current-location', 'default')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LocationData[]>([])
  const [useMetric, setUseMetric] = useLocalStorage<boolean>('weather-use-metric', true)
  const [apiKeys, setApiKeys] = useLocalStorage<Record<string, string>>('weather-api-keys', {})
  const [showApiSettings, setShowApiSettings] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const defaultLocations: SavedLocation[] = [
    { id: 'default', name: 'San Francisco', lat: 37.7749, lon: -122.4194, country: 'US' },
    { id: 'nyc', name: 'New York', lat: 40.7128, lon: -74.0060, country: 'US' },
    { id: 'london', name: 'London', lat: 51.5074, lon: -0.1278, country: 'GB' },
    { id: 'tokyo', name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP' },
  ]

  const getCurrentLocationData = (): SavedLocation => {
    const allLocations = [...defaultLocations, ...savedLocations]
    return allLocations.find(loc => loc.id === currentLocationId) || defaultLocations[0]
  }

  const loadWeather = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const location = getCurrentLocationData()
      
      // Load current weather
      const weatherData = await fetchWeatherData(location.lat, location.lon, useMetric)
      setWeather(weatherData)
      
      // Load extended data if enabled
      if (showExtended) {
        try {
          const [forecastData, hourlyData, alertData] = await Promise.all([
            fetchWeatherForecast(location.lat, location.lon, useMetric).catch(() => []),
            fetchHourlyForecast(location.lat, location.lon, useMetric).catch(() => []),
            fetchWeatherAlerts(location.lat, location.lon).catch(() => [])
          ])
          
          setForecast(forecastData)
          setHourlyForecast(hourlyData.slice(0, 8)) // Show next 8 hours
          setAlerts(alertData)
        } catch (extendedError) {
          console.warn('Extended weather data failed:', extendedError)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load weather data'
      setError(errorMessage)
      console.error('Weather loading error:', err)
      
      // Fallback to mock data if API fails
      const location = getCurrentLocationData()
      setWeather({
        location: `${location.name}, ${location.country}`,
        temperature: useMetric ? 22 : 72,
        condition: 'Data Unavailable',
        humidity: 50,
        windSpeed: useMetric ? 10 : 6,
        feelsLike: useMetric ? 24 : 75,
        icon: 'unknown'
      })
    } finally {
      setLoading(false)
    }
  }

  const useCurrentLocation = async () => {
    setIsGettingLocation(true)
    try {
      const coords = await getGeoLocation()
      
      // Create a temporary location for current position
      const currentPosLocation: SavedLocation = {
        id: 'current-location',
        name: 'Current Location',
        lat: coords.lat,
        lon: coords.lon,
        country: 'Unknown'
      }
      
      // Add to saved locations if not already present
      if (!savedLocations.find(loc => loc.id === 'current-location')) {
        setSavedLocations([currentPosLocation, ...savedLocations])
      }
      
      setCurrentLocationId('current-location')
    } catch (err) {
      setError('Could not get current location. Please allow location access.')
    } finally {
      setIsGettingLocation(false)
    }
  }

  useEffect(() => {
    loadWeather()
  }, [currentLocationId, useMetric, showExtended])

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    
    try {
      const results = await apiSearchLocations(query)
      setSearchResults(results)
    } catch (error) {
      console.error('Location search failed:', error)
      // Keep empty results if search fails
      setSearchResults([])
    }
  }

  const addLocation = (location: LocationData) => {
    const savedLocation: SavedLocation = {
      id: location.id,
      name: location.name,
      lat: location.lat,
      lon: location.lon,
      country: location.country,
      state: location.state
    }
    
    if (!savedLocations.find(loc => loc.id === location.id)) {
      setSavedLocations([...savedLocations, savedLocation])
    }
    setSearchQuery('')
    setSearchResults([])
  }

  const saveApiKey = (provider: string, key: string) => {
    setApiKey(provider, key)
    setApiKeys({ ...apiKeys, [provider]: key })
  }

  const removeLocation = (locationId: string) => {
    setSavedLocations(savedLocations.filter(loc => loc.id !== locationId))
    if (currentLocationId === locationId) {
      setCurrentLocationId('default')
    }
  }

  const switchLocation = (locationId: string) => {
    setCurrentLocationId(locationId)
    setShowSettings(false)
  }

  const getWeatherIcon = (condition: string, iconCode?: string, size: 'sm' | 'lg' = 'lg') => {
    const sizeClass = size === 'sm' ? 'w-6 h-6' : 'w-12 h-12'
    
    // If we have an actual weather icon URL from the API, use it
    if (iconCode && iconCode.startsWith('http')) {
      return <img src={iconCode} alt={condition} className={sizeClass} />
    }
    
    // Otherwise use Lucide icons based on condition
    const conditionLower = condition.toLowerCase()
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
      return <Sun className={`${sizeClass} text-yellow-400 animate-pulse-soft`} />
    } else if (conditionLower.includes('cloud') && !conditionLower.includes('rain')) {
      return <Cloud className={`${sizeClass} text-blue-300 animate-pulse-soft`} />
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
      return <CloudRain className={`${sizeClass} text-blue-500 animate-pulse-soft`} />
    } else if (conditionLower.includes('snow')) {
      return <Cloud className={`${sizeClass} text-white animate-pulse-soft`} />
    } else if (conditionLower.includes('wind')) {
      return <Wind className={`${sizeClass} text-green-400 animate-pulse-soft`} />
    } else {
      return <Sun className={`${sizeClass} text-yellow-400 animate-pulse-soft`} />
    }
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'text-red-500 bg-red-500'
      case 'severe': return 'text-orange-500 bg-orange-500'
      case 'moderate': return 'text-yellow-500 bg-yellow-500'
      default: return 'text-blue-500 bg-blue-500'
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="h-full flex flex-col">
      {/* Header with Settings */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span className="text-sm text-dark-text truncate">{weather.location}</span>
          {error && (
            <span className="text-xs text-red-400 truncate">({error})</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadWeather}
            disabled={loading}
            className="p-1 rounded hover:bg-dark-border transition-colors duration-200 text-dark-text-secondary hover:text-dark-text disabled:opacity-50"
            title="Refresh weather"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 rounded hover:bg-dark-border transition-colors duration-200 text-dark-text-secondary hover:text-dark-text"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!showSettings ? (
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Main Weather Display */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-3xl font-bold text-dark-text mb-1">
                {weather.temperature}°{useMetric ? 'C' : 'F'}
              </div>
              <div className="text-dark-text-secondary text-sm">
                Feels like {weather.feelsLike}°{useMetric ? 'C' : 'F'}
              </div>
            </div>
            
            <div className="text-center">
              {getWeatherIcon(weather.condition, weather.icon)}
              <div className="text-sm text-dark-text-secondary mt-2">
                {weather.condition}
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-dark-card">
              <div className="flex items-center">
                <Droplets className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-sm text-dark-text-secondary">Humidity</span>
              </div>
              <span className="text-sm font-medium text-dark-text">{weather.humidity}%</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-dark-card">
              <div className="flex items-center">
                <Wind className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-sm text-dark-text-secondary">Wind Speed</span>
              </div>
              <span className="text-sm font-medium text-dark-text">
                {weather.windSpeed} {useMetric ? 'km/h' : 'mph'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-dark-card">
              <div className="flex items-center">
                <Thermometer className="w-4 h-4 text-red-400 mr-2" />
                <span className="text-sm text-dark-text-secondary">Feels Like</span>
              </div>
              <span className="text-sm font-medium text-dark-text">
                {weather.feelsLike}°{useMetric ? 'C' : 'F'}
              </span>
            </div>

            {/* Additional weather details */}
            {weather.pressure && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-dark-card">
                <div className="flex items-center">
                  <span className="w-4 h-4 text-purple-400 mr-2 text-xs">⭲</span>
                  <span className="text-sm text-dark-text-secondary">Pressure</span>
                </div>
                <span className="text-sm font-medium text-dark-text">
                  {weather.pressure} hPa
                </span>
              </div>
            )}

            {weather.visibility && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-dark-card">
                <div className="flex items-center">
                  <span className="w-4 h-4 text-cyan-400 mr-2 text-xs">👁</span>
                  <span className="text-sm text-dark-text-secondary">Visibility</span>
                </div>
                <span className="text-sm font-medium text-dark-text">
                  {weather.visibility} km
                </span>
              </div>
            )}

            {weather.sunrise && weather.sunset && (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-dark-card">
                  <div className="flex items-center">
                    <span className="w-4 h-4 text-orange-400 mr-2 text-xs">🌅</span>
                    <span className="text-sm text-dark-text-secondary">Sunrise</span>
                  </div>
                  <span className="text-sm font-medium text-dark-text">
                    {weather.sunrise}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-dark-card">
                  <div className="flex items-center">
                    <span className="w-4 h-4 text-orange-600 mr-2 text-xs">🌇</span>
                    <span className="text-sm text-dark-text-secondary">Sunset</span>
                  </div>
                  <span className="text-sm font-medium text-dark-text">
                    {weather.sunset}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Weather Alerts */}
          {alerts.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-dark-text flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                Weather Alerts
              </h4>
              {alerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg bg-dark-card border-l-4 border-red-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${getAlertSeverityColor(alert.severity).replace('bg-', 'text-')}`}>
                        {alert.title}
                      </div>
                      <div className="text-xs text-dark-text-secondary mt-1 line-clamp-2">
                        {alert.description}
                      </div>
                      {alert.areas.length > 0 && (
                        <div className="text-xs text-dark-text-secondary mt-1">
                          Areas: {alert.areas.slice(0, 2).join(', ')}
                          {alert.areas.length > 2 && ` +${alert.areas.length - 2} more`}
                        </div>
                      )}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getAlertSeverityColor(alert.severity).split(' ')[1]} bg-opacity-80 flex-shrink-0 mt-1`}></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Extended Weather Data Toggle */}
          {showExtended && (
            <>
              {/* Hourly Forecast */}
              {hourlyForecast.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-dark-text mb-3">Next 8 Hours</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {hourlyForecast.map((hour, index) => (
                      <div key={index} className="p-2 rounded-lg bg-dark-card text-center">
                        <div className="text-xs text-dark-text-secondary mb-1">{hour.hour}</div>
                        <div className="flex justify-center mb-1">
                          {getWeatherIcon(hour.condition, hour.icon, 'sm')}
                        </div>
                        <div className="text-sm font-medium text-dark-text">
                          {hour.temperature}°
                        </div>
                        {hour.precipitationChance > 0 && (
                          <div className="text-xs text-blue-400 mt-1">
                            {hour.precipitationChance}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5-Day Forecast */}
              {forecast.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-dark-text mb-3">5-Day Forecast</h4>
                  <div className="space-y-2">
                    {forecast.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-dark-card">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm text-dark-text w-16">
                            {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                          </div>
                          <div className="flex justify-center w-8">
                            {getWeatherIcon(day.condition, day.icon, 'sm')}
                          </div>
                          <div className="text-xs text-dark-text-secondary flex-1">
                            {day.condition}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {day.precipitationChance > 0 && (
                            <div className="text-xs text-blue-400">
                              {day.precipitationChance}%
                            </div>
                          )}
                          <div className="text-sm text-dark-text-secondary">
                            {day.low}°
                          </div>
                          <div className="text-sm font-medium text-dark-text">
                            {day.high}°
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Settings Panel */}
          <div className="space-y-4">
            {/* API Status & Configuration */}
            <div className="p-3 rounded-lg bg-dark-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-text">Weather Data</span>
                <button
                  onClick={() => setShowApiSettings(!showApiSettings)}
                  className="p-1 text-dark-text-secondary hover:text-dark-text transition-colors duration-200"
                  title="Configure API keys"
                >
                  <Key className="w-4 h-4" />
                </button>
              </div>
              
              <div className="text-xs text-dark-text-secondary">
                {isWeatherApiConfigured() ? (
                  <span className="text-green-400">✓ API configured - Real data available</span>
                ) : (
                  <span className="text-orange-400">⚠ Using demo data - Configure API for real weather</span>
                )}
              </div>
              
              {showApiSettings && (
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-dark-text mb-1">
                      OpenWeatherMap API Key
                    </label>
                    <input
                      type="password"
                      value={apiKeys.openweather || ''}
                      onChange={(e) => saveApiKey('openweather', e.target.value)}
                      placeholder="Enter API key..."
                      className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-dark-text text-xs focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-text mb-1">
                      WeatherAPI Key
                    </label>
                    <input
                      type="password"
                      value={apiKeys.weatherapi || ''}
                      onChange={(e) => saveApiKey('weatherapi', e.target.value)}
                      placeholder="Enter API key..."
                      className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-dark-text text-xs focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <p className="text-xs text-dark-text-secondary">
                    Free keys available at{' '}
                    <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                      OpenWeatherMap
                    </a>{' '}
                    and{' '}
                    <a href="https://weatherapi.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                      WeatherAPI
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Units Toggle */}
            <div className="p-3 rounded-lg bg-dark-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-text">Temperature Units</span>
                <div className="flex bg-dark-bg rounded-lg p-1">
                  <button
                    onClick={() => setUseMetric(true)}
                    className={`px-3 py-1 text-xs rounded transition-colors duration-200 ${
                      useMetric ? 'bg-sky-500 text-white' : 'text-dark-text-secondary'
                    }`}
                  >
                    °C
                  </button>
                  <button
                    onClick={() => setUseMetric(false)}
                    className={`px-3 py-1 text-xs rounded transition-colors duration-200 ${
                      !useMetric ? 'bg-sky-500 text-white' : 'text-dark-text-secondary'
                    }`}
                  >
                    °F
                  </button>
                </div>
              </div>
            </div>

            {/* Extended Features Toggle */}
            <div className="p-3 rounded-lg bg-dark-card">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-dark-text">Extended Weather</span>
                  <div className="text-xs text-dark-text-secondary">Hourly forecast, alerts, and 5-day outlook</div>
                </div>
                <button
                  onClick={() => setShowExtended(!showExtended)}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                    showExtended ? 'bg-sky-500' : 'bg-dark-border'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 ${
                    showExtended ? 'translate-x-7' : 'translate-x-1'
                  }`}></div>
                </button>
              </div>
            </div>

            {/* Current Location */}
            <div className="p-3 rounded-lg bg-dark-card">
              <button
                onClick={useCurrentLocation}
                disabled={isGettingLocation}
                className="w-full flex items-center justify-center space-x-2 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                <Navigation className={`w-4 h-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
                <span className="text-sm">
                  {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
                </span>
              </button>
            </div>

            {/* Location Search */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-text-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    searchLocations(e.target.value)
                  }}
                  placeholder="Search for a location..."
                  className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-sky-400 transition-colors duration-200"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                  {searchResults.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => addLocation(location)}
                      className="w-full flex items-center justify-between p-2 bg-dark-card hover:bg-opacity-80 rounded-lg transition-colors duration-200 text-left"
                    >
                      <span className="text-sm text-dark-text">{location.name}, {location.country}</span>
                      <Plus className="w-3 h-3 text-sky-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Locations */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-dark-text">Locations</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                {[...defaultLocations, ...savedLocations].map((location) => (
                  <div
                    key={location.id}
                    className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-200 ${
                      currentLocationId === location.id
                        ? 'bg-sky-500 bg-opacity-20 border border-sky-500 border-opacity-30'
                        : 'bg-dark-card hover:bg-opacity-80'
                    }`}
                  >
                    <button
                      onClick={() => switchLocation(location.id)}
                      className="flex-1 text-left"
                    >
                      <span className={`text-sm font-medium ${
                        currentLocationId === location.id ? 'text-sky-400' : 'text-dark-text'
                      }`}>
                        {location.name}
                      </span>
                      <div className="text-xs text-dark-text-secondary">{location.country}</div>
                    </button>
                    
                    {!defaultLocations.some(def => def.id === location.id) && (
                      <button
                        onClick={() => removeLocation(location.id)}
                        className="p-1 text-dark-text-secondary hover:text-red-400 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WeatherWidget
