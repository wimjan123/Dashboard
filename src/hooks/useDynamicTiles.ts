import { useState, useCallback } from 'react'

export type TileSize = 'small' | 'normal' | 'medium' | 'large' | 'extra-large'
export type TileType = 'news' | 'weather' | 'todo' | 'shortcuts' | 'livestreams' | 'ai-chat' | 'minigames' | 'travel'

export interface DynamicTileConfig {
  id: string
  type: TileType
  title: string
  size: TileSize
  order: number
  isFullscreen: boolean
  config?: Record<string, any>
}

export interface TileTypeInfo {
  type: TileType
  name: string
  icon: string
  color: string
  description: string
  allowMultiple: boolean
  defaultSize: TileSize
}

export const TILE_TYPES: TileTypeInfo[] = [
  {
    type: 'news',
    name: 'News Feeds',
    icon: '📰',
    color: 'text-blue-400',
    description: 'RSS news feeds from multiple sources',
    allowMultiple: true,
    defaultSize: 'normal'
  },
  {
    type: 'weather',
    name: 'Weather',
    icon: '🌤️',
    color: 'text-sky-400',
    description: 'Current weather and forecast',
    allowMultiple: false,
    defaultSize: 'normal'
  },
  {
    type: 'todo',
    name: 'Tasks',
    icon: '✅',
    color: 'text-green-400',
    description: 'Task management with integrations',
    allowMultiple: true,
    defaultSize: 'normal'
  },
  {
    type: 'shortcuts',
    name: 'Quick Access',
    icon: '🔗',
    color: 'text-purple-400',
    description: 'Shortcuts to websites and applications',
    allowMultiple: true,
    defaultSize: 'normal'
  },
  {
    type: 'livestreams',
    name: 'Live Streams',
    icon: '📺',
    color: 'text-red-400',
    description: 'Video streams and live content',
    allowMultiple: true,
    defaultSize: 'medium'
  },
  {
    type: 'ai-chat',
    name: 'AI Assistant',
    icon: '🤖',
    color: 'text-blue-400',
    description: 'AI-powered chat assistant',
    allowMultiple: false,
    defaultSize: 'large'
  },
  {
    type: 'minigames',
    name: 'Mini Games',
    icon: '🎮',
    color: 'text-purple-400',
    description: 'Simple games and entertainment',
    allowMultiple: false,
    defaultSize: 'medium'
  },
  {
    type: 'travel',
    name: 'Travel & Commute',
    icon: '🗺️',
    color: 'text-orange-400',
    description: 'Route planning and travel information',
    allowMultiple: false,
    defaultSize: 'normal'
  }
]

const TILE_SIZE_CLASSES: Record<TileSize, string> = {
  'small': 'col-span-3 row-span-1',
  'normal': 'col-span-4 row-span-1',
  'medium': 'col-span-6 row-span-1',  
  'large': 'col-span-8 row-span-2',
  'extra-large': 'col-span-12 row-span-3'
}

const DEFAULT_TILES: DynamicTileConfig[] = [
  { id: 'news-1', type: 'news', title: 'News Feeds', size: 'normal', order: 1, isFullscreen: false },
  { id: 'weather-1', type: 'weather', title: 'Weather', size: 'normal', order: 2, isFullscreen: false },
  { id: 'todo-1', type: 'todo', title: 'Tasks', size: 'normal', order: 3, isFullscreen: false },
  { id: 'shortcuts-1', type: 'shortcuts', title: 'Quick Access', size: 'normal', order: 4, isFullscreen: false },
  { id: 'travel-1', type: 'travel', title: 'Travel & Commute', size: 'normal', order: 5, isFullscreen: false },
]

// Migration helper to convert complex column-based tiles back to simple sizes
const migrateTileData = (tiles: any[]): DynamicTileConfig[] => {
  return tiles.map(tile => {
    // If tile already has simple size property, it's already in the right format
    if (tile.size && !tile.columns) {
      return tile as DynamicTileConfig
    }

    // Migrate from complex column-based system back to simple sizes
    let size: TileSize = 'normal' // Default
    
    if (tile.columns !== undefined) {
      // Map columns back to simple sizes
      if (tile.columns === 2) size = 'small'
      else if (tile.columns === 3) size = 'normal'
      else if (tile.columns === 4) size = 'medium'
      else if (tile.columns === 5) size = 'large'
    } else if (tile.width !== undefined) {
      // Handle old width-based tiles
      if (tile.width <= 250) size = 'small'
      else if (tile.width <= 350) size = 'normal'
      else if (tile.width <= 500) size = 'medium'
      else size = 'large'
    }

    return {
      id: tile.id,
      type: tile.type,
      title: tile.title,
      size,
      order: tile.order || 0,
      isFullscreen: tile.isFullscreen || false,
      config: tile.config
    } as DynamicTileConfig
  })
}

export const useDynamicTiles = () => {
  const [tiles, setTiles] = useState<DynamicTileConfig[]>(() => {
    const savedTiles = localStorage.getItem('dashboard-dynamic-tiles')
    if (savedTiles) {
      try {
        const parsedTiles = JSON.parse(savedTiles)
        const migratedTiles = migrateTileData(parsedTiles)
        // Save migrated data back to localStorage
        localStorage.setItem('dashboard-dynamic-tiles', JSON.stringify(migratedTiles))
        return migratedTiles
      } catch (error) {
        console.warn('Failed to parse saved tiles, using defaults:', error)
        return DEFAULT_TILES
      }
    }
    return DEFAULT_TILES
  })

  const [draggedTile, setDraggedTile] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  const saveTiles = useCallback((newTiles: DynamicTileConfig[]) => {
    setTiles(newTiles)
    localStorage.setItem('dashboard-dynamic-tiles', JSON.stringify(newTiles))
  }, [])

  const addTile = useCallback((type: TileType, customTitle?: string, config?: Record<string, any>) => {
    const tileInfo = TILE_TYPES.find(t => t.type === type)
    if (!tileInfo) return

    // Check if multiple instances are allowed
    if (!tileInfo.allowMultiple && tiles.some(tile => tile.type === type)) {
      throw new Error(`Only one ${tileInfo.name} tile is allowed`)
    }

    const newTile: DynamicTileConfig = {
      id: `${type}-${Date.now()}`,
      type,
      title: customTitle || tileInfo.name,
      size: tileInfo.defaultSize,
      order: Math.max(...tiles.map(t => t.order), 0) + 1,
      isFullscreen: false,
      config
    }

    saveTiles([...tiles, newTile])
  }, [tiles, saveTiles])

  const duplicateTile = useCallback((tileId: string, customTitle?: string) => {
    const tile = tiles.find(t => t.id === tileId)
    if (!tile) return

    const tileInfo = TILE_TYPES.find(t => t.type === tile.type)
    if (!tileInfo?.allowMultiple) {
      throw new Error(`${tileInfo?.name || 'This tile'} cannot be duplicated`)
    }

    const newTile: DynamicTileConfig = {
      ...tile,
      id: `${tile.type}-${Date.now()}`,
      title: customTitle || `${tile.title} (Copy)`,
      order: Math.max(...tiles.map(t => t.order), 0) + 1,
      isFullscreen: false
    }

    saveTiles([...tiles, newTile])
  }, [tiles, saveTiles])

  const removeTile = useCallback((tileId: string) => {
    saveTiles(tiles.filter(tile => tile.id !== tileId))
  }, [tiles, saveTiles])

  const updateTile = useCallback((tileId: string, updates: Partial<DynamicTileConfig>) => {
    saveTiles(tiles.map(tile => 
      tile.id === tileId ? { ...tile, ...updates } : tile
    ))
  }, [tiles, saveTiles])

  const reorderTiles = useCallback((sourceId: string, targetId: string) => {
    const sourceIndex = tiles.findIndex(tile => tile.id === sourceId)
    const targetIndex = tiles.findIndex(tile => tile.id === targetId)
    
    if (sourceIndex === -1 || targetIndex === -1) return

    const newTiles = [...tiles]
    const [sourceItem] = newTiles.splice(sourceIndex, 1)
    newTiles.splice(targetIndex, 0, sourceItem)
    
    // Update order numbers
    newTiles.forEach((tile, index) => {
      tile.order = index + 1
    })

    saveTiles(newTiles)
  }, [tiles, saveTiles])

  const getTileClass = useCallback((tileId: string) => {
    const tile = tiles.find(t => t.id === tileId)
    if (!tile) return TILE_SIZE_CLASSES.normal

    if (tile.isFullscreen) {
      return 'col-span-12 row-span-1'
    }

    return TILE_SIZE_CLASSES[tile.size]
  }, [tiles])

  const getSortedTiles = useCallback(() => {
    return [...tiles].sort((a, b) => a.order - b.order)
  }, [tiles])

  const getFullscreenTile = useCallback(() => {
    return tiles.find(tile => tile.isFullscreen)
  }, [tiles])

  const toggleFullscreen = useCallback((tileId: string) => {
    saveTiles(tiles.map(tile => ({
      ...tile,
      isFullscreen: tile.id === tileId ? !tile.isFullscreen : false
    })))
  }, [tiles, saveTiles])

  const expandTile = useCallback((tileId: string) => {
    const tile = tiles.find(t => t.id === tileId)
    if (!tile) return

    const sizes: TileSize[] = ['small', 'normal', 'medium', 'large', 'extra-large']
    const currentIndex = sizes.indexOf(tile.size)
    const nextIndex = (currentIndex + 1) % sizes.length
    
    updateTile(tileId, { size: sizes[nextIndex] })
  }, [tiles, updateTile])

  const resetTile = useCallback((tileId: string) => {
    updateTile(tileId, { size: 'normal', isFullscreen: false })
  }, [updateTile])

  const handleDragStart = useCallback((tileId: string) => {
    setDraggedTile(tileId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedTile(null)
  }, [])

  const handleDrop = useCallback((targetTileId: string) => {
    if (draggedTile && draggedTile !== targetTileId) {
      reorderTiles(draggedTile, targetTileId)
    }
    setDraggedTile(null)
  }, [draggedTile, reorderTiles])

  const getAvailableTileTypes = useCallback(() => {
    return TILE_TYPES.filter(tileType => 
      tileType.allowMultiple || !tiles.some(tile => tile.type === tileType.type)
    )
  }, [tiles])

  const resetToDefaults = useCallback(() => {
    saveTiles(DEFAULT_TILES)
  }, [saveTiles])

  return {
    tiles,
    editMode,
    setEditMode,
    draggedTile,
    addTile,
    duplicateTile,
    removeTile,
    updateTile,
    reorderTiles,
    getTileClass,
    getSortedTiles,
    getFullscreenTile,
    toggleFullscreen,
    expandTile,
    resetTile,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    getAvailableTileTypes,
    resetToDefaults,
    TILE_TYPES
  }
}