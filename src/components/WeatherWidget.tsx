import React, { useState, useEffect } from 'react'
import { Sun, Cloud, CloudRain, Wind, Droplets, Thermometer, Settings, MapPin, Search, Plus, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  feelsLike: number
  icon: string
}

interface SavedLocation {
  id: string
  name: string
  lat: number
  lon: number
  country: string
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [savedLocations, setSavedLocations] = useLocalStorage<SavedLocation[]>('weather-locations', [])
  const [currentLocationId, setCurrentLocationId] = useLocalStorage<string>('weather-current-location', 'default')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SavedLocation[]>([])
  const [useMetric, setUseMetric] = useLocalStorage<boolean>('weather-use-metric', true)

  const defaultLocations: SavedLocation[] = [
    { id: 'default', name: 'San Francisco', lat: 37.7749, lon: -122.4194, country: 'US' },
    { id: 'nyc', name: 'New York', lat: 40.7128, lon: -74.0060, country: 'US' },
    { id: 'london', name: 'London', lat: 51.5074, lon: -0.1278, country: 'GB' },
    { id: 'tokyo', name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP' },
  ]

  const getCurrentLocation = (): SavedLocation => {
    const allLocations = [...defaultLocations, ...savedLocations]
    return allLocations.find(loc => loc.id === currentLocationId) || defaultLocations[0]
  }

  const getMockWeatherData = (location: SavedLocation): WeatherData => {
    // Different mock data based on location
    const mockData: Record<string, Partial<WeatherData>> = {
      'default': { temperature: 22, condition: 'Partly Cloudy', humidity: 65, windSpeed: 12, feelsLike: 24 },
      'nyc': { temperature: 18, condition: 'Sunny', humidity: 45, windSpeed: 8, feelsLike: 20 },
      'london': { temperature: 15, condition: 'Rainy', humidity: 80, windSpeed: 15, feelsLike: 13 },
      'tokyo': { temperature: 25, condition: 'Cloudy', humidity: 70, windSpeed: 10, feelsLike: 27 },
    }
    
    const base = mockData[location.id] || mockData['default']
    return {
      location: `${location.name}, ${location.country}`,
      temperature: useMetric ? base.temperature! : Math.round(base.temperature! * 9/5 + 32),
      condition: base.condition!,
      humidity: base.humidity!,
      windSpeed: useMetric ? base.windSpeed! : Math.round(base.windSpeed! * 0.621371),
      feelsLike: useMetric ? base.feelsLike! : Math.round(base.feelsLike! * 9/5 + 32),
      icon: base.condition!.toLowerCase().replace(' ', '-')
    }
  }

  const loadWeather = async () => {
    setLoading(true)
    const location = getCurrentLocation()
    
    // For now, use mock data
    setTimeout(() => {
      setWeather(getMockWeatherData(location))
      setLoading(false)
    }, 800)
  }

  useEffect(() => {
    loadWeather()
  }, [currentLocationId, useMetric])

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    
    // Mock location search results
    const mockResults: SavedLocation[] = [
      { id: 'paris', name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'FR' },
      { id: 'berlin', name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'DE' },
      { id: 'sydney', name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'AU' },
    ].filter(loc => loc.name.toLowerCase().includes(query.toLowerCase()))
    
    setSearchResults(mockResults)
  }

  const addLocation = (location: SavedLocation) => {
    if (!savedLocations.find(loc => loc.id === location.id)) {
      setSavedLocations([...savedLocations, location])
    }
    setSearchQuery('')
    setSearchResults([])
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

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-12 h-12 text-yellow-400 animate-pulse-soft" />
      case 'partly cloudy':
        return <Cloud className="w-12 h-12 text-blue-300 animate-pulse-soft" />
      case 'rainy':
        return <CloudRain className="w-12 h-12 text-blue-500 animate-pulse-soft" />
      default:
        return <Sun className="w-12 h-12 text-yellow-400 animate-pulse-soft" />
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-sky-400" />
          <span className="text-sm text-dark-text truncate">{weather.location}</span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 rounded hover:bg-dark-border transition-colors duration-200 text-dark-text-secondary hover:text-dark-text"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {!showSettings ? (
        <>
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
              {getWeatherIcon(weather.condition)}
              <div className="text-sm text-dark-text-secondary mt-2">
                {weather.condition}
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="space-y-3">
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
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-hidden">
          {/* Settings Panel */}
          <div className="space-y-4">
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