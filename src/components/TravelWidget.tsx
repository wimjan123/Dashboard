import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, Clock, Car, Train, Bike, Users, AlertCircle, Loader, RefreshCw, Star, BookmarkPlus, Bookmark, ArrowUpDown, Home, Building2, Bus, Zap, Calendar, Timer } from 'lucide-react'

interface Location {
  lat: number
  lng: number
  address?: string
  placeId?: string
}

interface SearchResult {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
}

interface Route {
  distance: string
  duration: string
  durationInTraffic?: string
  mode: 'driving' | 'walking' | 'transit' | 'bicycling'
  steps?: string[]
  transitDetails?: {
    departureTime?: string
    arrivalTime?: string
    transfers?: number
    agencies?: string[]
    fare?: string
    lines?: string[]
  }
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
  const [departure, setDeparture] = useState('')
  const [departureLocation, setDepartureLocation] = useState<Location | null>(null)
  const [destination, setDestination] = useState('')
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null)
  const [useCurrentLocation, setUseCurrentLocation] = useState(true)
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [selectedMode, setSelectedMode] = useState<'driving' | 'walking' | 'transit' | 'bicycling'>('driving')
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([])
  const [savedDepartures, setSavedDepartures] = useState<SavedDestination[]>([])
  const [showSaved, setShowSaved] = useState(false)
  const [departureSuggestions, setDepartureSuggestions] = useState<SearchResult[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<SearchResult[]>([])
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const modes = [
    { id: 'driving' as const, name: 'Drive', icon: Car, color: 'text-blue-400' },
    { id: 'walking' as const, name: 'Walk', icon: Users, color: 'text-green-400' },
    { id: 'transit' as const, name: 'Transit', icon: Train, color: 'text-purple-400' },
    { id: 'bicycling' as const, name: 'Bike', icon: Bike, color: 'text-orange-400' }
  ]

  // Load saved destinations and departures on mount
  useEffect(() => {
    const savedDest = localStorage.getItem('dashboard-saved-destinations')
    if (savedDest) {
      setSavedDestinations(JSON.parse(savedDest))
    }
    
    const savedDep = localStorage.getItem('dashboard-saved-departures')
    if (savedDep) {
      setSavedDepartures(JSON.parse(savedDep))
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

  const searchLocations = async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return []
    
    try {
      // Using Nominatim for autocomplete search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      )
      const data = await response.json()
      
      return data.map((item: any) => ({
        placeId: item.place_id,
        name: item.display_name.split(',')[0],
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }))
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }

  const handleDepartureSearch = async (value: string) => {
    setDeparture(value)
    setDepartureLocation(null)
    
    if (value.trim().length > 2) {
      const results = await searchLocations(value)
      setDepartureSuggestions(results)
      setShowDepartureSuggestions(true)
    } else {
      setDepartureSuggestions([])
      setShowDepartureSuggestions(false)
    }
  }

  const handleDestinationSearch = async (value: string) => {
    setDestination(value)
    setDestinationLocation(null)
    
    if (value.trim().length > 2) {
      const results = await searchLocations(value)
      setDestinationSuggestions(results)
      setShowDestinationSuggestions(true)
    } else {
      setDestinationSuggestions([])
      setShowDestinationSuggestions(false)
    }
  }

  const selectDepartureLocation = (result: SearchResult) => {
    setDeparture(result.address)
    setDepartureLocation({
      lat: result.lat,
      lng: result.lng,
      address: result.address,
      placeId: result.placeId
    })
    setShowDepartureSuggestions(false)
    
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [result.address, ...prev.filter(addr => addr !== result.address)].slice(0, 5)
      return updated
    })
  }

  const selectDestinationLocation = (result: SearchResult) => {
    setDestination(result.address)
    setDestinationLocation({
      lat: result.lat,
      lng: result.lng,
      address: result.address,
      placeId: result.placeId
    })
    setShowDestinationSuggestions(false)
    
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [result.address, ...prev.filter(addr => addr !== result.address)].slice(0, 5)
      return updated
    })
  }

  const calculateRoute = async () => {
    const originLocation = useCurrentLocation ? currentLocation : departureLocation
    
    if (!originLocation || !destination.trim()) {
      setError('Departure location and destination are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Geocode departure if needed (and not using current location)
      let departLocation = originLocation
      if (!useCurrentLocation && !departureLocation && departure.trim()) {
        departLocation = await geocodeAddress(departure)
        setDepartureLocation(departLocation)
      }

      // Geocode destination if needed
      let destLocation = destinationLocation
      if (!destLocation) {
        destLocation = await geocodeAddress(destination)
        setDestinationLocation(destLocation)
      }

      // Calculate routes for different modes
      const routePromises = modes.map(mode => calculateRouteForMode(departLocation!, destLocation!, mode.id))
      const routeResults = await Promise.allSettled(routePromises)
      
      const validRoutes: Route[] = []
      routeResults.forEach((result) => {
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
    if (mode === 'transit') {
      // Enhanced transit routing with mock data for demonstration
      return calculateTransitRoute(origin, destination)
    }
    
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

  const calculateTransitRoute = async (origin: Location, destination: Location): Promise<Route | null> => {
    // Calculate approximate distance for transit estimation
    const distance = calculateDistance(origin, destination)
    
    // Mock transit data based on distance
    const baseTime = Math.max(15, distance * 2) // Minimum 15 minutes
    const transfers = distance > 10 ? Math.floor(distance / 8) : 0
    
    const now = new Date()
    const departureTime = new Date(now.getTime() + 5 * 60000) // 5 minutes from now
    const arrivalTime = new Date(departureTime.getTime() + baseTime * 60000)
    
    return {
      distance: formatDistance(distance * 1000),
      duration: formatDuration(baseTime * 60),
      mode: 'transit',
      transitDetails: {
        departureTime: departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        arrivalTime: arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        transfers,
        agencies: transfers > 0 ? ['Metro', 'Bus'] : ['Bus'],
        fare: `€${(2.5 + transfers * 0.5).toFixed(2)}`,
        lines: transfers > 0 ? ['Line 1', 'Bus 42'] : ['Bus 15']
      }
    }
  }

  const calculateDistance = (origin: Location, destination: Location): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (destination.lat - origin.lat) * Math.PI / 180
    const dLng = (destination.lng - origin.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
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

  const saveDeparture = () => {
    if (!departure.trim() || !departureLocation) return

    const newDeparture: SavedDestination = {
      id: Date.now().toString(),
      name: departure.trim(),
      address: departure.trim(),
      location: departureLocation,
      isFavorite: false
    }

    const updated = [...savedDepartures, newDeparture]
    setSavedDepartures(updated)
    localStorage.setItem('dashboard-saved-departures', JSON.stringify(updated))
  }

  const swapLocations = () => {
    const tempDeparture = departure
    const tempDepartureLocation = departureLocation
    
    setDeparture(destination)
    setDepartureLocation(destinationLocation)
    setDestination(tempDeparture)
    setDestinationLocation(tempDepartureLocation)
  }

  const toggleFavorite = (id: string, type: 'destination' | 'departure') => {
    if (type === 'destination') {
      const updated = savedDestinations.map(dest =>
        dest.id === id ? { ...dest, isFavorite: !dest.isFavorite } : dest
      )
      setSavedDestinations(updated)
      localStorage.setItem('dashboard-saved-destinations', JSON.stringify(updated))
    } else {
      const updated = savedDepartures.map(dept =>
        dept.id === id ? { ...dept, isFavorite: !dept.isFavorite } : dept
      )
      setSavedDepartures(updated)
      localStorage.setItem('dashboard-saved-departures', JSON.stringify(updated))
    }
  }

  const loadSavedDestination = (savedDest: SavedDestination) => {
    setDestination(savedDest.address)
    setDestinationLocation(savedDest.location)
    setShowSaved(false)
  }
  
  const loadSavedDeparture = (savedDep: SavedDestination) => {
    setDeparture(savedDep.address)
    setDepartureLocation(savedDep.location)
    setUseCurrentLocation(false)
    setShowSaved(false)
  }

  const selectedRoute = routes.find(route => route.mode === selectedMode)
  const favorites = savedDestinations.filter(dest => dest.isFavorite).slice(0, 3)

  return (
    <div className="h-full flex flex-col">
      {/* Departure Location */}
      <div className="mb-4 p-3 bg-dark-card rounded-lg border border-dark-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-dark-text">Departure</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={getCurrentLocation}
              className="p-1 rounded hover:bg-dark-border transition-colors duration-200"
              title="Refresh current location"
            >
              <RefreshCw className="w-3 h-3 text-dark-text-secondary" />
            </button>
            {!useCurrentLocation && departure.trim() && departureLocation && (
              <button
                onClick={saveDeparture}
                className="p-1 bg-green-500 hover:bg-green-600 rounded transition-colors duration-200"
                title="Save departure location"
              >
                <BookmarkPlus className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          {/* Use Current Location Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useCurrentLocation}
              onChange={(e) => {
                setUseCurrentLocation(e.target.checked)
                if (e.target.checked) {
                  setDeparture('')
                  setDepartureLocation(null)
                }
              }}
              className="w-4 h-4 text-blue-400 bg-dark-bg border-dark-border rounded focus:ring-blue-400 focus:ring-2"
            />
            <span className="text-sm text-dark-text">Use current location</span>
          </label>
          
          {useCurrentLocation ? (
            locationError ? (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertCircle className="w-3 h-3" />
                <span>{locationError}</span>
              </div>
            ) : currentLocation ? (
              <p className="text-xs text-dark-text-secondary truncate pl-6">
                {currentLocation.address || `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
              </p>
            ) : (
              <div className="flex items-center space-x-2 text-dark-text-secondary text-sm pl-6">
                <Loader className="w-3 h-3 animate-spin" />
                <span>Getting location...</span>
              </div>
            )
          ) : (
            <div className="relative">
              <input
                type="text"
                value={departure}
                onChange={(e) => handleDepartureSearch(e.target.value)}
                placeholder="Enter departure location..."
                className="w-full pl-3 pr-4 py-2 bg-dark-bg border border-dark-border rounded text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-blue-400 transition-colors duration-200 text-sm"
                onFocus={() => departure.trim() && setShowDepartureSuggestions(true)}
                onBlur={() => setTimeout(() => setShowDepartureSuggestions(false), 200)}
              />
              
              {/* Departure Suggestions */}
              {showDepartureSuggestions && departureSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-dark-card border border-dark-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {departureSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.placeId}
                      className="px-4 py-2 hover:bg-dark-bg cursor-pointer text-sm text-dark-text"
                      onClick={() => selectDepartureLocation(suggestion)}
                    >
                      <div className="font-medium">{suggestion.name}</div>
                      <div className="text-xs text-dark-text-secondary truncate">{suggestion.address}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Swap Button */}
      <div className="mb-4 flex justify-center">
        <button
          onClick={swapLocations}
          disabled={useCurrentLocation || !departure.trim() || !destination.trim()}
          className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors duration-200"
          title="Swap departure and destination"
        >
          <ArrowUpDown className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Destination Input */}
      <div className="mb-4">
        <div className="mb-2 flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-dark-text">Destination</span>
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={destination}
              onChange={(e) => handleDestinationSearch(e.target.value)}
              placeholder="Enter destination..."
              className="w-full pl-3 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-blue-400 transition-colors duration-200"
              onKeyPress={(e) => e.key === 'Enter' && calculateRoute()}
              onFocus={() => destination.trim() && setShowDestinationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
            />
            
            {/* Destination Suggestions */}
            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-dark-card border border-dark-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {destinationSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.placeId}
                    className="px-4 py-2 hover:bg-dark-bg cursor-pointer text-sm text-dark-text"
                    onClick={() => selectDestinationLocation(suggestion)}
                  >
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-xs text-dark-text-secondary truncate">{suggestion.address}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="p-2 bg-dark-card border border-dark-border rounded-lg hover:bg-opacity-80 transition-colors duration-200"
            title="Saved locations"
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

        {/* Saved Locations */}
        {showSaved && (savedDestinations.length > 0 || savedDepartures.length > 0) && (
          <div className="mt-2 max-h-40 overflow-y-auto scrollbar-thin bg-dark-card border border-dark-border rounded-lg">
            {/* Saved Departures */}
            {savedDepartures.length > 0 && (
              <div>
                <div className="px-2 py-1 bg-dark-bg border-b border-dark-border">
                  <div className="flex items-center space-x-1 text-xs text-dark-text-secondary">
                    <Home className="w-3 h-3" />
                    <span>Departure Locations</span>
                  </div>
                </div>
                {savedDepartures.map(dept => (
                  <div
                    key={dept.id}
                    onClick={() => loadSavedDeparture(dept)}
                    className="flex items-center justify-between p-2 hover:bg-dark-bg cursor-pointer transition-colors duration-200"
                  >
                    <span className="text-sm text-dark-text truncate">{dept.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(dept.id, 'departure')
                      }}
                      className="p-1 rounded hover:bg-dark-border transition-colors duration-200"
                    >
                      <Star className={`w-3 h-3 ${dept.isFavorite ? 'text-yellow-400 fill-current' : 'text-dark-text-secondary'}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Saved Destinations */}
            {savedDestinations.length > 0 && (
              <div>
                <div className="px-2 py-1 bg-dark-bg border-b border-dark-border">
                  <div className="flex items-center space-x-1 text-xs text-dark-text-secondary">
                    <Building2 className="w-3 h-3" />
                    <span>Destinations</span>
                  </div>
                </div>
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
                        toggleFavorite(dest.id, 'destination')
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
        )}
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculateRoute}
        disabled={(!useCurrentLocation && !departureLocation) || (!useCurrentLocation && !departure.trim()) || (useCurrentLocation && !currentLocation) || !destination.trim() || loading}
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

                  {/* Enhanced Transit Details */}
                  {selectedRoute.mode === 'transit' && selectedRoute.transitDetails && (
                    <div className="p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Train className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-medium text-purple-400">Public Transport Details</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="text-center">
                          <Timer className="w-4 h-4 mx-auto mb-1 text-green-400" />
                          <div className="text-sm font-semibold text-dark-text">{selectedRoute.transitDetails.departureTime}</div>
                          <div className="text-xs text-dark-text-secondary">Departure</div>
                        </div>
                        <div className="text-center">
                          <Clock className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                          <div className="text-sm font-semibold text-dark-text">{selectedRoute.transitDetails.arrivalTime}</div>
                          <div className="text-xs text-dark-text-secondary">Arrival</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {selectedRoute.transitDetails.transfers !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-dark-text-secondary">Transfers:</span>
                            <span className="text-xs text-dark-text font-medium">
                              {selectedRoute.transitDetails.transfers === 0 ? 'Direct' : `${selectedRoute.transitDetails.transfers} transfer${selectedRoute.transitDetails.transfers > 1 ? 's' : ''}`}
                            </span>
                          </div>
                        )}
                        
                        {selectedRoute.transitDetails.fare && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-dark-text-secondary">Estimated Fare:</span>
                            <span className="text-xs text-green-400 font-medium">{selectedRoute.transitDetails.fare}</span>
                          </div>
                        )}

                        {selectedRoute.transitDetails.lines && selectedRoute.transitDetails.lines.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-dark-text-secondary">Lines:</span>
                            <div className="flex space-x-1">
                              {selectedRoute.transitDetails.lines.map((line, index) => (
                                <span key={index} className="text-xs bg-purple-500 text-white px-2 py-1 rounded">
                                  {line}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedRoute.transitDetails.agencies && selectedRoute.transitDetails.agencies.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-dark-text-secondary">Operators:</span>
                            <div className="flex space-x-1">
                              {selectedRoute.transitDetails.agencies.map((agency, index) => (
                                <span key={index} className="text-xs text-dark-text flex items-center space-x-1">
                                  {agency === 'Bus' && <Bus className="w-3 h-3" />}
                                  {agency === 'Metro' && <Train className="w-3 h-3" />}
                                  <span>{agency}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const originLocation = useCurrentLocation ? currentLocation : departureLocation
                        if (originLocation && destinationLocation) {
                          const mode = selectedRoute.mode === 'transit' ? 'transit' : selectedRoute.mode === 'walking' ? 'walking' : selectedRoute.mode === 'bicycling' ? 'bicycling' : 'driving'
                          const url = `https://www.google.com/maps/dir/${originLocation.lat},${originLocation.lng}/${destinationLocation.lat},${destinationLocation.lng}/@${(originLocation.lat + destinationLocation.lat) / 2},${(originLocation.lng + destinationLocation.lng) / 2},12z/data=!3m1!4b1!4m2!4m1!3e${mode === 'driving' ? '0' : mode === 'walking' ? '2' : mode === 'transit' ? '3' : '1'}`
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
