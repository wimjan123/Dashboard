import { useState, useCallback } from 'react'

export type TileSize = 'normal' | 'expanded' | 'large' | 'fullscreen'

export interface TileState {
  id: string
  size: TileSize
  order: number
  isFullscreen: boolean
}

export const useTileExpansion = () => {
  const [tiles, setTiles] = useState<Record<string, TileState>>({
    'news': { id: 'news', size: 'normal', order: 1, isFullscreen: false },
    'weather': { id: 'weather', size: 'normal', order: 2, isFullscreen: false },
    'todo': { id: 'todo', size: 'normal', order: 3, isFullscreen: false },
    'shortcuts': { id: 'shortcuts', size: 'normal', order: 4, isFullscreen: false },
    'livestreams': { id: 'livestreams', size: 'normal', order: 5, isFullscreen: false },
    'ai-chat': { id: 'ai-chat', size: 'normal', order: 6, isFullscreen: false },
    'minigames': { id: 'minigames', size: 'normal', order: 7, isFullscreen: false },
  })

  const [draggedTile, setDraggedTile] = useState<string | null>(null)

  const expandTile = useCallback((tileId: string) => {
    setTiles(prev => ({
      ...prev,
      [tileId]: {
        ...prev[tileId],
        size: prev[tileId].size === 'normal' ? 'expanded' : 
              prev[tileId].size === 'expanded' ? 'large' : 'normal'
      }
    }))
  }, [])

  const toggleFullscreen = useCallback((tileId: string) => {
    setTiles(prev => ({
      ...prev,
      [tileId]: {
        ...prev[tileId],
        isFullscreen: !prev[tileId].isFullscreen,
        size: !prev[tileId].isFullscreen ? 'fullscreen' : 'normal'
      }
    }))
  }, [])

  const resetTile = useCallback((tileId: string) => {
    setTiles(prev => ({
      ...prev,
      [tileId]: { ...prev[tileId], size: 'normal', isFullscreen: false }
    }))
  }, [])

  const reorderTiles = useCallback((sourceId: string, targetId: string) => {
    setTiles(prev => {
      const sourceOrder = prev[sourceId].order
      const targetOrder = prev[targetId].order
      
      return {
        ...prev,
        [sourceId]: { ...prev[sourceId], order: targetOrder },
        [targetId]: { ...prev[targetId], order: sourceOrder }
      }
    })
  }, [])

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

  const getTileClass = useCallback((tileId: string) => {
    const tile = tiles[tileId]
    if (!tile) return 'col-span-4 row-span-1'

    if (tile.isFullscreen) {
      return 'col-span-12 row-span-1'
    }

    switch (tile.size) {
      case 'expanded':
        return 'col-span-8 row-span-2'
      case 'large':
        return 'col-span-12 row-span-3'
      default:
        return 'col-span-4 row-span-1'
    }
  }, [tiles])

  const getSortedTiles = useCallback(() => {
    return Object.values(tiles).sort((a, b) => a.order - b.order)
  }, [tiles])

  const getFullscreenTile = useCallback(() => {
    return Object.values(tiles).find(tile => tile.isFullscreen)
  }, [tiles])

  return {
    tiles,
    expandTile,
    toggleFullscreen,
    resetTile,
    getTileClass,
    getSortedTiles,
    getFullscreenTile,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    draggedTile
  }
}