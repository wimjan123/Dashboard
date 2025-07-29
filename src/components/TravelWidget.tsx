import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, Clock, Car, Train, Bike, Users, AlertCircle, Loader, RefreshCw, Star, BookmarkPlus, Bookmark } from 'lucide-react'

interface Location {
  lat: number
  lng: number
  address?: string
}

interface Route {
  distance: string
  duration: string
  durationInTraffic?: string
  mode: 'driving' | 'walking' | 'transit' | 'bicycling'
  steps?: string[]
}

interface SavedDestination {
  id: string
  name: string
  address: string
  location: Location
  isFavorite: boolean
}

const TravelWidget: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [destination, setDestination] = useState('')
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [selectedMode, setSelectedMode] = useState<'driving' | 'walking' | 'transit' | 'bicycling'>('driving')
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([])
  const [showSaved, setShowSaved] = useState(false)

  const modes = [
    { id: 'driving' as const, name: 'Drive', icon: Car, color: 'text-blue-400' },
    { id: 'walking' as const, name: 'Walk', icon: Users, color: 'text-green-400' },
    { id: 'transit' as const, name: 'Transit', icon: Train, color: 'text-purple-400' },
    { id: 'bicycling' as const, name: 'Bike', icon: Bike, color: 'text-orange-400' }
  ]

  // Load saved destinations on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-saved-destinations')
    if (saved) {
      setSavedDestinations(JSON.parse(saved))
    }
  }, [])

  // Get user's current location
  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = () => {
    setLocationError(null)
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        
        try {
          // Reverse geocode to get address
          const address = await reverseGeocode(location)
          setCurrentLocation({ ...location, address })
        } catch (error) {
          setCurrentLocation(location)
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied by user')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out')
            break
          default:
            setLocationError('An unknown error occurred')
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  const reverseGeocode = async (location: Location): Promise<string> => {
    // Using a free geocoding service (nominatim)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&addressdetails=1`
    )
    const data = await response.json()
    return data.display_name || 'Unknown location'
  }

  const geocodeAddress = async (address: string): Promise<Location> => {
    // Using a free geocoding service (nominatim)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`
    )
    const data = await response.json()
    
    if (data.length === 0) {
      throw new Error('Address not found')
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      address: data[0].display_name
    }
  }

  const calculateRoute = async () => {
    if (!currentLocation || !destination.trim()) {
      setError('Current location and destination are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Geocode destination if needed
      let destLocation = destinationLocation
      if (!destLocation) {
        destLocation = await geocodeAddress(destination)
        setDestinationLocation(destLocation)
      }

      // Calculate routes for different modes
      const routePromises = modes.map(mode => calculateRouteForMode(currentLocation, destLocation!, mode.id))
      const routeResults = await Promise.allSettled(routePromises)
      
      const validRoutes: Route[] = []
      routeResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          validRoutes.push(result.value)
        }
      })

      setRoutes(validRoutes)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to calculate route')
    } finally {
      setLoading(false)
    }
  }

  const calculateRouteForMode = async (
    origin: Location, 
    destination: Location, 
    mode: 'driving' | 'walking' | 'transit' | 'bicycling'
  ): Promise<Route | null> => {
    // Using OSRM for routing (free service)
    const profile = mode === 'driving' ? 'car' : mode === 'bicycling' ? 'bike' : 'foot'
    
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false&alternatives=false&steps=false`
      )
      const data = await response.json()
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        return {
          distance: formatDistance(route.distance),
          duration: formatDuration(route.duration),
          mode,
          steps: []
        }
      }
    } catch (error) {
      console.warn(`Failed to calculate ${mode} route:`, error)
    }
    
    return null
  }

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`
    }
    return `${(meters / 1000).toFixed(1)} km`
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const saveDestination = () => {
    if (!destination.trim() || !destinationLocation) return

    const newDestination: SavedDestination = {
      id: Date.now().toString(),
      name: destination.trim(),
      address: destination.trim(),
      location: destinationLocation,
      isFavorite: false
    }

    const updated = [...savedDestinations, newDestination]
    setSavedDestinations(updated)
    localStorage.setItem('dashboard-saved-destinations', JSON.stringify(updated))
  }

  const toggleFavorite = (id: string) => {
    const updated = savedDestinations.map(dest =>
      dest.id === id ? { ...dest, isFavorite: !dest.isFavorite } : dest
    )
    setSavedDestinations(updated)
    localStorage.setItem('dashboard-saved-destinations', JSON.stringify(updated))
  }

  const loadSavedDestination = (savedDest: SavedDestination) => {
    setDestination(savedDest.address)
    setDestinationLocation(savedDest.location)
    setShowSaved(false)
  }

  const selectedRoute = routes.find(route => route.mode === selectedMode)
  const favorites = savedDestinations.filter(dest => dest.isFavorite).slice(0, 3)

  return (
    <div className="h-full flex flex-col">
      {/* Current Location */}
      <div className="mb-4 p-3 bg-dark-card rounded-lg border border-dark-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-dark-text">Current Location</span>
          </div>
          <button
            onClick={getCurrentLocation}
            className="p-1 rounded hover:bg-dark-border transition-colors duration-200"
            title="Refresh location"
          >
            <RefreshCw className="w-3 h-3 text-dark-text-secondary" />
          </button>
        </div>
        
        {locationError ? (
          <div className="flex items-center space-x-2 text-red-400 text-sm">
            <AlertCircle className="w-3 h-3" />
            <span>{locationError}</span>
          </div>
        ) : currentLocation ? (
          <p className="text-xs text-dark-text-secondary truncate">
            {currentLocation.address || `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
          </p>
        ) : (
          <div className="flex items-center space-x-2 text-dark-text-secondary text-sm">
            <Loader className="w-3 h-3 animate-spin" />
            <span>Getting location...</span>
          </div>
        )}
      </div>

      {/* Destination Input */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-text-secondary" />
            <input
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value)
                setDestinationLocation(null)
              }}
              placeholder="Enter destination..."
              className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-blue-400 transition-colors duration-200"
              onKeyPress={(e) => e.key === 'Enter' && calculateRoute()}
            />
          </div>
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="p-2 bg-dark-card border border-dark-border rounded-lg hover:bg-opacity-80 transition-colors duration-200"
            title="Saved destinations"
          >
            <Bookmark className="w-4 h-4 text-dark-text-secondary" />
          </button>
          {destination.trim() && destinationLocation && (
            <button
              onClick={saveDestination}
              className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors duration-200"
              title="Save destination"
            >
              <BookmarkPlus className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {favorites.map(fav => (
              <button
                key={fav.id}
                onClick={() => loadSavedDestination(fav)}
                className="px-2 py-1 bg-dark-border rounded text-xs text-dark-text-secondary hover:text-dark-text hover:bg-opacity-80 transition-colors duration-200 flex items-center space-x-1"
              >
                <Star className="w-3 h-3 text-yellow-400" />
                <span>{fav.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Saved Destinations */}
        {showSaved && savedDestinations.length > 0 && (
          <div className="mt-2 max-h-32 overflow-y-auto scrollbar-thin bg-dark-card border border-dark-border rounded-lg">
            {savedDestinations.map(dest => (
              <div
                key={dest.id}
                onClick={() => loadSavedDestination(dest)}
                className="flex items-center justify-between p-2 hover:bg-dark-bg cursor-pointer transition-colors duration-200"
              >
                <span className="text-sm text-dark-text truncate">{dest.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(dest.id)
                  }}
                  className="p-1 rounded hover:bg-dark-border transition-colors duration-200"
                >
                  <Star className={`w-3 h-3 ${dest.isFavorite ? 'text-yellow-400 fill-current' : 'text-dark-text-secondary'}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculateRoute}
        disabled={!currentLocation || !destination.trim() || loading}
        className="w-full mb-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-700 disabled:opacity-50 rounded-lg text-white font-medium transition-colors duration-200"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Calculating...</span>
          </div>
        ) : (
          'Get Directions'
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Route Results */}
      {routes.length > 0 && (
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Mode Selector */}
          <div className="mb-4 grid grid-cols-4 gap-1">
            {modes.map(mode => {
              const route = routes.find(r => r.mode === mode.id)
              const ModeIcon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  disabled={!route}
                  className={`p-2 rounded-lg text-center transition-all duration-200 ${
                    selectedMode === mode.id
                      ? 'bg-blue-500 text-white'
                      : route
                        ? 'bg-dark-card text-dark-text-secondary hover:text-dark-text hover:bg-opacity-80'
                        : 'bg-dark-card text-dark-text-secondary opacity-50 cursor-not-allowed'
                  }`}
                >
                  <ModeIcon className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs">{mode.name}</span>
                </button>
              )
            })}
          </div>

          {/* Selected Route Details */}
          {selectedRoute && (
            <div className="space-y-3">
              <div className="p-4 bg-dark-card rounded-lg border border-dark-border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <div className="text-lg font-semibold text-dark-text">{selectedRoute.duration}</div>
                    <div className="text-xs text-dark-text-secondary">Duration</div>
                    {selectedRoute.durationInTraffic && (
                      <div className="text-xs text-orange-400 mt-1">
                        {selectedRoute.durationInTraffic} in traffic
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <Navigation className="w-5 h-5 mx-auto mb-1 text-green-400" />
                    <div className="text-lg font-semibold text-dark-text">{selectedRoute.distance}</div>
                    <div className="text-xs text-dark-text-secondary">Distance</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (currentLocation && destinationLocation) {
                      const url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${destinationLocation.lat},${destinationLocation.lng}`
                      window.open(url, '_blank')
                    }
                  }}
                  className="py-2 px-3 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm transition-colors duration-200"
                >
                  Open in Maps
                </button>
                <button
                  onClick={() => {
                    if (destinationLocation) {
                      navigator.clipboard.writeText(destination)
                    }
                  }}
                  className="py-2 px-3 bg-dark-card hover:bg-opacity-80 rounded-lg text-dark-text text-sm border border-dark-border transition-colors duration-200"
                >
                  Copy Address
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TravelWidget