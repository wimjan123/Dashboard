import { useState, useCallback } from 'react'

export type LayoutPreset = 'compact' | 'balanced' | 'spacious'

export interface GlobalSettings {
  layoutPreset: LayoutPreset
  gapSize: 'small' | 'medium' | 'large'
  globalTheme: 'default' | 'minimal' | 'glassmorphism' | 'neon' | 'vintage'
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full'
}

export type TileSize = 'small' | 'medium' | 'large'
export type TileType = 'news' | 'weather' | 'todo' | 'shortcuts' | 'livestreams' | 'ai-chat' | 'minigames' | 'travel' | 'system-monitor' | 'calendar' | 'music-player' | 'network-monitor' | 'image-gallery' | 'notes'

export interface TileCustomization {
  theme: 'default' | 'minimal' | 'glassmorphism' | 'neon' | 'vintage'
  backgroundColor?: string
  borderColor?: string
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'gradient'
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full'
  opacity?: number
  blur?: number
}

export interface Tile {
  id: string
  type: TileType
  title: string
  size: TileSize
  customization?: TileCustomization
}

export interface TileTypeInfo {
  type: TileType
  name: string
  icon: string
  color: string
  description: string
  allowMultiple: boolean
}

export const TILE_TYPES: TileTypeInfo[] = [
  {
    type: 'news',
    name: 'News Feeds',
    icon: '📰',
    color: 'text-blue-400',
    description: 'RSS news feeds from multiple sources',
    allowMultiple: true
  },
  {
    type: 'weather',
    name: 'Weather',
    icon: '🌤️',
    color: 'text-sky-400',
    description: 'Current weather and forecast',
    allowMultiple: false
  },
  {
    type: 'todo',
    name: 'Tasks',
    icon: '✅',
    color: 'text-green-400',
    description: 'Task management with integrations',
    allowMultiple: true
  },
  {
    type: 'shortcuts',
    name: 'Quick Access',
    icon: '🔗',
    color: 'text-purple-400',
    description: 'Shortcuts to websites and applications',
    allowMultiple: true
  },
  {
    type: 'livestreams',
    name: 'Live Streams',
    icon: '📺',
    color: 'text-red-400',
    description: 'Video streams and live content',
    allowMultiple: true
  },
  {
    type: 'ai-chat',
    name: 'AI Assistant',
    icon: '🤖',
    color: 'text-blue-400',
    description: 'AI-powered chat assistant',
    allowMultiple: false
  },
  {
    type: 'minigames',
    name: 'Mini Games',
    icon: '🎮',
    color: 'text-purple-400',
    description: 'Simple games and entertainment',
    allowMultiple: false
  },
  {
    type: 'travel',
    name: 'Travel & Commute',
    icon: '🗺️',
    color: 'text-orange-400',
    description: 'Route planning and travel information',
    allowMultiple: false
  },
  {
    type: 'system-monitor',
    name: 'System Monitor',
    icon: '💻',
    color: 'text-cyan-400',
    description: 'CPU, RAM, disk usage with real-time charts',
    allowMultiple: false
  },
  {
    type: 'calendar',
    name: 'Calendar',
    icon: '📅',
    color: 'text-indigo-400',
    description: 'Monthly view with event integration',
    allowMultiple: false
  },
  {
    type: 'music-player',
    name: 'Music Player',
    icon: '🎵',
    color: 'text-pink-400',
    description: 'Basic audio controls and now-playing display',
    allowMultiple: false
  },
  {
    type: 'network-monitor',
    name: 'Network Monitor',
    icon: '📡',
    color: 'text-emerald-400',
    description: 'Internet speed and connectivity status',
    allowMultiple: false
  },
  {
    type: 'image-gallery',
    name: 'Image Gallery',
    icon: '🖼️',
    color: 'text-violet-400',
    description: 'Rotating photo slideshow from local folders',
    allowMultiple: true
  },
  {
    type: 'notes',
    name: 'Notes',
    icon: '📝',
    color: 'text-yellow-400',
    description: 'Quick text notes with rich formatting',
    allowMultiple: true
  }
]

const TILE_SIZE_CLASSES: Record<TileSize, string> = {
  'small': 'col-span-1',   // 1/3 width
  'medium': 'col-span-2',  // 2/3 width  
  'large': 'col-span-3'    // full width
}

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  layoutPreset: 'balanced',
  gapSize: 'medium',
  globalTheme: 'default',
  borderRadius: 'medium'
}

const DEFAULT_TILES: Tile[] = [
  { id: 'news-1', type: 'news', title: 'News Feeds', size: 'medium' },
  { id: 'weather-1', type: 'weather', title: 'Weather', size: 'small' },
  { id: 'todo-1', type: 'todo', title: 'Tasks', size: 'small' },
  { id: 'shortcuts-1', type: 'shortcuts', title: 'Quick Access', size: 'small' },
  { id: 'travel-1', type: 'travel', title: 'Travel & Commute', size: 'medium' }
]

// Simple migration - convert any old data to new 3-size format
const migrateTiles = (oldTiles: any[]): Tile[] => {
  return oldTiles.map(tile => ({
    id: tile.id || `${tile.type}-${Date.now()}`,
    type: tile.type || 'news',
    title: tile.title || 'Tile',
    size: 'medium' as TileSize // Default everything to medium
  }))
}

export const useDynamicTiles = () => {
  const [tiles, setTiles] = useState<Tile[]>(() => {
    const saved = localStorage.getItem('dashboard-tiles')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const migrated = migrateTiles(parsed)
        localStorage.setItem('dashboard-tiles', JSON.stringify(migrated))
        return migrated
      } catch {
        return DEFAULT_TILES
      }
    }
    return DEFAULT_TILES
  })

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() => {
    const saved = localStorage.getItem('dashboard-global-settings')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return DEFAULT_GLOBAL_SETTINGS
      }
    }
    return DEFAULT_GLOBAL_SETTINGS
  })

  const [editMode, setEditMode] = useState(false)

  const saveTiles = useCallback((newTiles: Tile[]) => {
    setTiles(newTiles)
    localStorage.setItem('dashboard-tiles', JSON.stringify(newTiles))
  }, [])

  const saveGlobalSettings = useCallback((newSettings: GlobalSettings) => {
    setGlobalSettings(newSettings)
    localStorage.setItem('dashboard-global-settings', JSON.stringify(newSettings))
  }, [])

  const addTile = useCallback((type: TileType, title?: string) => {
    const tileInfo = TILE_TYPES.find(t => t.type === type)
    if (!tileInfo) return

    if (!tileInfo.allowMultiple && tiles.some(tile => tile.type === type)) {
      throw new Error(`Only one ${tileInfo.name} tile is allowed`)
    }

    const newTile: Tile = {
      id: `${type}-${Date.now()}`,
      type,
      title: title || tileInfo.name,
      size: 'medium'
    }

    saveTiles([...tiles, newTile])
  }, [tiles, saveTiles])

  const removeTile = useCallback((tileId: string) => {
    saveTiles(tiles.filter(tile => tile.id !== tileId))
  }, [tiles, saveTiles])

  const updateTile = useCallback((tileId: string, updates: Partial<Tile>) => {
    saveTiles(tiles.map(tile => 
      tile.id === tileId ? { ...tile, ...updates } : tile
    ))
  }, [tiles, saveTiles])

  const changeTileSize = useCallback((tileId: string) => {
    const tile = tiles.find(t => t.id === tileId)
    if (!tile) return

    const sizes: TileSize[] = ['small', 'medium', 'large']
    const currentIndex = sizes.indexOf(tile.size)
    const nextIndex = (currentIndex + 1) % sizes.length
    
    updateTile(tileId, { size: sizes[nextIndex] })
  }, [tiles, updateTile])

  const getTileClass = useCallback((tileId: string) => {
    const tile = tiles.find(t => t.id === tileId)
    if (!tile) return TILE_SIZE_CLASSES.medium
    return TILE_SIZE_CLASSES[tile.size]
  }, [tiles])

  const getAvailableTileTypes = useCallback(() => {
    return TILE_TYPES.filter(tileType => 
      tileType.allowMultiple || !tiles.some(tile => tile.type === tileType.type)
    )
  }, [tiles])

  const resetToDefaults = useCallback(() => {
    saveTiles(DEFAULT_TILES)
  }, [saveTiles])

  const getGridClasses = useCallback(() => {
    const gapClasses = {
      small: 'gap-2',
      medium: 'gap-4', 
      large: 'gap-6'
    }
    
    const heightClasses = {
      compact: 'min-h-[250px]',
      balanced: 'min-h-[300px]',
      spacious: 'min-h-[350px]'
    }

    return `dashboard-grid grid-cols-3 auto-rows-fr ${gapClasses[globalSettings.gapSize]} ${heightClasses[globalSettings.layoutPreset]} ${globalSettings.layoutPreset}`
  }, [globalSettings])

  const getTileStyleClasses = useCallback((tile: Tile) => {
    const customization = tile.customization
    const globalTheme = globalSettings.globalTheme
    
    let baseClasses = 'glass-effect rounded-2xl p-4 flex flex-col tile-container transition-all duration-300 group relative'
    
    // Apply customization overrides
    if (customization?.theme && customization.theme !== 'default') {
      switch (customization.theme) {
        case 'minimal':
          baseClasses = baseClasses.replace('glass-effect', 'bg-dark-card border border-dark-border')
          break
        case 'neon':
          baseClasses += ' shadow-lg shadow-blue-500/20 border-blue-400/50'
          break
        case 'vintage':
          baseClasses += ' bg-amber-50/5 border-amber-400/30'
          break
      }
    }

    // Apply border radius from global settings
    const radiusClasses = {
      none: 'rounded-none',
      small: 'rounded-lg',
      medium: 'rounded-2xl',
      large: 'rounded-3xl',
      full: 'rounded-full'
    }
    
    if (globalSettings.borderRadius !== 'medium') {
      baseClasses = baseClasses.replace('rounded-2xl', radiusClasses[globalSettings.borderRadius])
    }

    return baseClasses
  }, [globalSettings])

  const updateGlobalSettings = useCallback((updates: Partial<GlobalSettings>) => {
    const newSettings = { ...globalSettings, ...updates }
    saveGlobalSettings(newSettings)
  }, [globalSettings, saveGlobalSettings])

  return {
    tiles,
    globalSettings,
    editMode,
    setEditMode,
    addTile,
    removeTile,
    updateTile,
    changeTileSize,
    getTileClass,
    getTileStyleClasses,
    getGridClasses,
    getAvailableTileTypes,
    resetToDefaults,
    updateGlobalSettings,
    TILE_TYPES
  }
}
