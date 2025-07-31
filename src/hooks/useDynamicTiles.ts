import { useState, useCallback } from 'react'

export type TileSize = 'small' | 'normal' | 'medium' | 'large' | 'extra-large'
export type TileColumns = 2 | 3 | 4 | 5
export type TileType = 'news' | 'weather' | 'todo' | 'shortcuts' | 'livestreams' | 'ai-chat' | 'minigames' | 'travel'

export interface DynamicTileConfig {
  id: string
  type: TileType
  title: string
  columns: TileColumns
  height: number
  order: number
  x?: number
  y?: number
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

export const TILE_SIZE_CLASSES: Record<TileSize, {width: number; height: number}> = {
  'small': { width: 200, height: 200 },
  'normal': { width: 300, height: 300 },
  'medium': { width: 400, height: 400 },
  'large': { width: 600, height: 600 },
  'extra-large': { width: 800, height: 800 }
}

// Column-based width system for responsive grid
export const COLUMN_WIDTHS: Record<TileColumns, { span: number; baseWidth: number; minWidth: number }> = {
  2: { span: 2, baseWidth: 300, minWidth: 250 },
  3: { span: 3, baseWidth: 450, minWidth: 350 },
  4: { span: 4, baseWidth: 600, minWidth: 450 },
  5: { span: 5, baseWidth: 750, minWidth: 550 }
}

export const GRID_CONFIG = {
  columns: 12,
  gap: 24,
  minTileHeight: 200,
  defaultTileHeight: 300
}

const DEFAULT_TILES: DynamicTileConfig[] = [
  { id: 'news-1', type: 'news', title: 'News Feeds', columns: 3, height: 300, order: 1, isFullscreen: false },
  { id: 'weather-1', type: 'weather', title: 'Weather', columns: 2, height: 300, order: 2, isFullscreen: false },
  { id: 'todo-1', type: 'todo', title: 'Tasks', columns: 3, height: 300, order: 3, isFullscreen: false },
  { id: 'shortcuts-1', type: 'shortcuts', title: 'Quick Access', columns: 2, height: 300, order: 4, isFullscreen: false },
  { id: 'travel-1', type: 'travel', title: 'Travel & Commute', columns: 4, height: 300, order: 5, isFullscreen: false },
]

// Migration helper to convert old tile format to new column-based format
const migrateTileData = (tiles: any[]): DynamicTileConfig[] => {
  return tiles.map(tile => {
    // If tile already has columns, it's already migrated
    if (tile.columns !== undefined) {
      return tile as DynamicTileConfig
    }

    // Migrate old width-based tiles to column-based tiles
    let columns: TileColumns = 3 // Default
    
    if (tile.width !== undefined) {
      // Map old width values to columns
      if (tile.width <= 250) columns = 2
      else if (tile.width <= 350) columns = 3
      else if (tile.width <= 500) columns = 4
      else columns = 5
    }

    // Ensure we have a valid height
    const height = tile.height || GRID_CONFIG.defaultTileHeight

    return {
      id: tile.id,
      type: tile.type,
      title: tile.title,
      columns,
      height,
      order: tile.order || 0,
      x: tile.x,
      y: tile.y,
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

    // Default to 3 columns for new tiles
    const defaultColumns: TileColumns = 3

    const newTile: DynamicTileConfig = {
      id: `${type}-${Date.now()}`,
      type,
      title: customTitle || tileInfo.name,
      columns: defaultColumns,
      height: GRID_CONFIG.defaultTileHeight,
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
      isFullscreen: false,
      x: undefined,
      y: undefined
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
    if (!tile) return ''

    if (tile.isFullscreen) {
      return 'fixed inset-0 z-50'
    }
    
    // Calculate column span based on grid system
    const columnSpan = Math.round((tile.columns * GRID_CONFIG.columns) / 6) // 6 is our base division
    return `col-span-${Math.min(columnSpan, GRID_CONFIG.columns)}`
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

    const columnOptions: TileColumns[] = [2, 3, 4, 5]
    const currentIndex = columnOptions.findIndex(c => c === tile.columns)
    const nextIndex = (currentIndex + 1) % columnOptions.length
    
    updateTile(tileId, { 
      columns: columnOptions[nextIndex]
    })
  }, [tiles, updateTile])

  const resetTile = useCallback((tileId: string) => {
    updateTile(tileId, { 
      columns: 3,
      height: GRID_CONFIG.defaultTileHeight,
      isFullscreen: false,
      x: undefined,
      y: undefined
    })
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

  // Collision detection and positioning utilities
  const checkCollision = useCallback((tile1: DynamicTileConfig, tile2: DynamicTileConfig) => {
    if (!tile1.x || !tile1.y || !tile2.x || !tile2.y) return false
    
    const tile1Width = COLUMN_WIDTHS[tile1.columns].baseWidth
    const tile2Width = COLUMN_WIDTHS[tile2.columns].baseWidth
    
    return !(
      tile1.x + tile1Width <= tile2.x ||
      tile2.x + tile2Width <= tile1.x ||
      tile1.y + tile1.height <= tile2.y ||
      tile2.y + tile2.height <= tile1.y
    )
  }, [])

  const findValidPosition = useCallback((targetTile: DynamicTileConfig, excludeId?: string) => {
    const containerWidth = 1200 // Approximate container width
    const tileWidth = COLUMN_WIDTHS[targetTile.columns].baseWidth
    const maxX = containerWidth - tileWidth
    const gridSize = GRID_CONFIG.gap
    
    for (let y = 0; y < 2000; y += gridSize) {
      for (let x = 0; x <= maxX; x += gridSize) {
        const testTile = { ...targetTile, x, y }
        
        const hasCollision = tiles.some(tile => {
          if (tile.id === excludeId || tile.id === targetTile.id) return false
          return checkCollision(testTile, tile)
        })
        
        if (!hasCollision) {
          return { x, y }
        }
      }
    }
    
    // Fallback to stacked position
    return { x: 0, y: tiles.length * (GRID_CONFIG.defaultTileHeight + GRID_CONFIG.gap) }
  }, [tiles, checkCollision])

  const updateTilePosition = useCallback((tileId: string, x: number, y: number) => {
    const tile = tiles.find(t => t.id === tileId)
    if (!tile) return

    const updatedTile = { ...tile, x, y }
    const hasCollision = tiles.some(otherTile => {
      if (otherTile.id === tileId) return false
      return checkCollision(updatedTile, otherTile)
    })

    if (!hasCollision) {
      updateTile(tileId, { x, y })
    } else {
      // Find a valid position
      const validPosition = findValidPosition(updatedTile, tileId)
      updateTile(tileId, validPosition)
    }
  }, [tiles, checkCollision, findValidPosition, updateTile])

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
    checkCollision,
    findValidPosition,
    updateTilePosition,
    TILE_TYPES,
    COLUMN_WIDTHS,
    GRID_CONFIG
  }
}
