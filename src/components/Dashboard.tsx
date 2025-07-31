import React, { useState, Suspense, useCallback } from 'react'
import { Rss, Cloud, CheckSquare, ExternalLink, Video, Maximize2, Minimize2, Expand, GripVertical, Bot, Gamepad2, MapPin, Plus, Edit, RotateCcw, X, Save } from 'lucide-react'
import { lazy } from 'react'
import { useDynamicTiles } from '../hooks/useDynamicTiles'
import ThemeSelector from './ThemeSelector'

const NewsFeeds = lazy(() => import('./NewsFeeds'))
const WeatherWidget = lazy(() => import('./WeatherWidget'))
const TodoList = lazy(() => import('./TodoList'))
const Shortcuts = lazy(() => import('./Shortcuts'))
const Livestreams = lazy(() => import('./Livestreams'))
const AIChat = lazy(() => import('./AIChat'))
const Minigames = lazy(() => import('./Minigames'))
const TravelWidget = lazy(() => import('./TravelWidget'))
const AddTileModal = lazy(() => import('./AddTileModal'))

const Dashboard: React.FC = () => {
  const {
    tiles,
    editMode,
    setEditMode,
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
    getAvailableTileTypes,
    resetToDefaults
  } = useDynamicTiles()

  const [showAddTile, setShowAddTile] = useState(false)
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null)
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null)
  
  const currentTime = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
  const currentDate = new Date().toLocaleDateString([], { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Click-based tile reordering handlers
  const handleTileSelect = useCallback((tileId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (!editMode) return
    
    if (selectedTileId === tileId) {
      // Deselect if clicking the same tile
      setSelectedTileId(null)
      setHoveredTargetId(null)
    } else if (selectedTileId && selectedTileId !== tileId) {
      // Swap tiles if one is already selected
      reorderTiles(selectedTileId, tileId)
      setSelectedTileId(null)
      setHoveredTargetId(null)
    } else {
      // Select tile
      setSelectedTileId(tileId)
      setHoveredTargetId(null)
    }
  }, [editMode, selectedTileId, reorderTiles])

  const handleTileClick = useCallback((tileId: string, event: React.MouseEvent) => {
    if (!editMode || !selectedTileId || selectedTileId === tileId) return
    
    event.preventDefault()
    event.stopPropagation()
    
    // Swap with selected tile
    reorderTiles(selectedTileId, tileId)
    setSelectedTileId(null)
    setHoveredTargetId(null)
  }, [editMode, selectedTileId, reorderTiles])

  const handleClickOutside = useCallback((event: React.MouseEvent) => {
    if (selectedTileId) {
      setSelectedTileId(null)
      setHoveredTargetId(null)
    }
  }, [selectedTileId])

  const handleTitleEdit = useCallback((tileId: string, newTitle: string) => {
    updateTile(tileId, { title: newTitle })
  }, [updateTile])

  const renderTileContent = (type: string) => {
    switch (type) {
      case 'news':
        return <NewsFeeds />
      case 'weather':
        return <WeatherWidget />
      case 'todo':
        return <TodoList />
      case 'shortcuts':
        return <Shortcuts />
      case 'livestreams':
        return <Livestreams />
      case 'ai-chat':
        return <AIChat />
      case 'minigames':
        return <Minigames />
      case 'travel':
        return <TravelWidget />
      default:
        return <div>Unknown tile type</div>
    }
  }

  const getTileIcon = (type: string) => {
    switch (type) {
      case 'news':
        return <Rss className="w-4 h-4" />
      case 'weather':
        return <Cloud className="w-4 h-4" />
      case 'todo':
        return <CheckSquare className="w-4 h-4" />
      case 'shortcuts':
        return <ExternalLink className="w-4 h-4" />
      case 'livestreams':
        return <Video className="w-4 h-4" />
      case 'ai-chat':
        return <Bot className="w-4 h-4" />
      case 'minigames':
        return <Gamepad2 className="w-4 h-4" />
      case 'travel':
        return <MapPin className="w-4 h-4" />
      default:
        return <ExternalLink className="w-4 h-4" />
    }
  }

  const getTileColor = (type: string) => {
    switch (type) {
      case 'news':
        return 'text-blue-400'
      case 'weather':
        return 'text-sky-400'
      case 'todo':
        return 'text-green-400'
      case 'shortcuts':
        return 'text-purple-400'
      case 'livestreams':
        return 'text-red-400'
      case 'ai-chat':
        return 'text-blue-400'
      case 'minigames':
        return 'text-purple-400'
      case 'travel':
        return 'text-orange-400'
      default:
        return 'text-gray-400'
    }
  }

  const TileHeader: React.FC<{
    tileId: string
    icon: React.ReactNode
    title: string
    color: string
  }> = ({ tileId, icon, title, color }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(title)

    const handleSave = () => {
      if (editValue.trim() && editValue !== title) {
        handleTitleEdit(tileId, editValue.trim())
      }
      setIsEditing(false)
      setEditValue(title)
    }

    const handleCancel = () => {
      setIsEditing(false)
      setEditValue(title)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    }

    return (
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`${color} flex-shrink-0`}>
            {icon}
          </div>
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-b border-blue-400 text-dark-text text-sm font-semibold focus:outline-none"
              autoFocus
            />
          ) : (
            <h3 
              className={`text-sm font-semibold ${color} truncate cursor-pointer hover:text-opacity-80 transition-colors duration-200`}
              onClick={() => editMode && setIsEditing(true)}
              title={editMode ? "Click to edit title" : title}
            >
              {title}
            </h3>
          )}
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          {editMode && (
            <button
              onClick={(e) => handleTileSelect(tileId, e)}
              className={`p-1 rounded transition-all duration-200 ${
                selectedTileId === tileId
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-border'
              }`}
              title="Select tile for reordering"
            >
              <GripVertical className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => expandTile(tileId)}
            className="text-dark-text-secondary hover:text-green-400 transition-colors duration-200 p-1 rounded hover:bg-dark-border"
            title="Resize tile (cycles through sizes)"
          >
            <Expand className="w-3 h-3" />
          </button>
          <button
            onClick={() => toggleFullscreen(tileId)}
            className="text-dark-text-secondary hover:text-blue-400 transition-colors duration-200 p-1 rounded hover:bg-dark-border"
            title="Toggle fullscreen"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          {editMode && (
            <button
              onClick={() => removeTile(tileId)}
              className="text-dark-text-secondary hover:text-red-400 transition-colors duration-200 p-1 rounded hover:bg-dark-border"
              title="Remove tile"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    )
  }

  const TileComponent: React.FC<{
    tileId: string
    icon: React.ReactNode
    title: string
    color: string
    component: React.ReactNode
  }> = ({ tileId, icon, title, color, component }) => {
    const tile = tiles.find(t => t.id === tileId)
    if (!tile) return null

    const fullscreenTile = getFullscreenTile()
    const isSelected = selectedTileId === tileId
    const isTargetAvailable = selectedTileId && selectedTileId !== tileId
    const animationDelay = `${tiles.indexOf(tile) * 100}ms`

    return (
      <div
        className={`
          glass-effect rounded-2xl p-6 animate-slide-up flex flex-col 
          transition-all duration-300 group h-full relative
          ${getTileClass(tileId)}
          ${editMode ? 'border-2' : 'border border-transparent'}
          ${isSelected 
            ? 'border-blue-500 shadow-lg shadow-blue-500/25 bg-blue-500/5 scale-105' 
            : editMode 
            ? 'border-blue-400/30 hover:border-blue-400/50' 
            : 'border-transparent hover:border-white/10'
          }
          ${isTargetAvailable && !isSelected
            ? 'border-green-400/50 hover:border-green-400 cursor-pointer' 
            : ''
          }
          ${fullscreenTile?.id === tileId ? 'fixed inset-4 z-50 !w-full !h-full' : ''}
        `}
        style={{ animationDelay }}
        onClick={(e) => handleTileClick(tileId, e)}
      >
        <TileHeader 
          tileId={tileId} 
          icon={icon} 
          title={title} 
          color={color} 
        />
        <div className="flex-1 overflow-hidden min-h-0 max-h-full">
          <div className="h-full overflow-y-auto scrollbar-thin">
            {component}
          </div>
        </div>
        
        {/* Edit Mode Indicators */}
        {editMode && (
          <>
            <div className={`absolute top-1 right-1 text-white text-xs px-2 py-1 rounded-md transition-all duration-200 ${
              isSelected ? 'bg-blue-500 shadow-lg' : 'bg-blue-500/75'
            }`}>
              {isSelected ? 'SELECTED' : tile.size.toUpperCase()}
            </div>
            
            {/* Target indicator when tile can be swapped */}
            {isTargetAvailable && !isSelected && (
              <div className="absolute inset-0 border-2 border-dashed border-green-400/50 rounded-2xl bg-green-400/10 flex items-center justify-center backdrop-blur-sm">
                <div className="text-green-400 font-medium text-sm bg-green-900/50 px-3 py-1 rounded-lg">
                  Click to swap here
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  const fullscreenTile = getFullscreenTile()

  if (fullscreenTile) {
    // Render only the fullscreen tile
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-slate-900">
        <TileComponent
          tileId={fullscreenTile.id}
          icon={getTileIcon(fullscreenTile.type)}
          title={fullscreenTile.title}
          color={getTileColor(fullscreenTile.type)}
          component={renderTileContent(fullscreenTile.type)}
        />
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-slate-900" onClick={handleClickOutside}>
      {/* Header */}
      <div className="mb-8 text-center animate-fade-in p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddTile(true)}
              className="p-2 rounded-lg bg-green-500 hover:bg-green-600 transition-colors duration-200 group"
              title="Add tile"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
            
            {/* Edit Mode Toggle */}
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                editMode 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' 
                  : 'bg-dark-card hover:bg-dark-border text-dark-text'
              }`}
              title={editMode ? "Exit edit mode" : "Enter edit mode"}
            >
              {editMode ? (
                <>
                  <Save className="w-4 h-4" />
                  <span className="text-sm font-medium">Save Layout</span>
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit Layout</span>
                </>
              )}
            </button>

            {editMode && (
              <button
                onClick={resetToDefaults}
                className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors duration-200"
                title="Reset to default layout"
              >
                <RotateCcw className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeSelector />
          </div>
        </div>
        
        {editMode && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-xl">
            <p className="text-blue-400 text-sm font-medium text-center mb-2">
              🎯 Edit Mode Active {selectedTileId && '• Tile Selected'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-blue-300 text-xs">
              <div>
                <div className="font-medium text-blue-200 mb-1">Selection & Swapping:</div>
                <div>• Click grip handle (⋮) to select tiles</div>
                <div>• Click another grip to swap positions</div>
              </div>
              <div>
                <div className="font-medium text-blue-200 mb-1">Customization:</div>
                <div>• Click expand button (⤢) to resize tiles</div>
                <div>• Click tile titles to rename them</div>
                <div>• Use fullscreen button (⛶) for focus mode</div>
              </div>
            </div>
            {selectedTileId && (
              <div className="mt-2 p-2 bg-blue-500/20 rounded-lg text-center">
                <span className="text-blue-200 text-xs">
                  Selected tile → Click another tile's grip to swap positions
                </span>
              </div>
            )}
          </div>
        )}
        
        <h1 className="text-4xl font-bold text-dark-text mb-2 tracking-wide">
          {currentTime}
        </h1>
        <p className="text-dark-text-secondary text-lg">
          {currentDate}
        </p>
      </div>

      {/* Tiles Grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-12 auto-rows-fr gap-6 min-h-[400px]">
          {getSortedTiles().map((tile) => (
            <Suspense 
              key={tile.id} 
              fallback={
                <div className={`${getTileClass(tile.id)} glass-effect rounded-2xl p-6 flex items-center justify-center`}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              }
            >
              <TileComponent
                tileId={tile.id}
                icon={getTileIcon(tile.type)}
                title={tile.title}
                color={getTileColor(tile.type)}
                component={renderTileContent(tile.type)}
              />
            </Suspense>
          ))}
        </div>
      </div>

      {/* Add Tile Modal */}
      {showAddTile && (
        <Suspense fallback={<div>Loading...</div>}>
          <AddTileModal
            isOpen={showAddTile}
            onClose={() => setShowAddTile(false)}
            availableTileTypes={getAvailableTileTypes()}
            existingTiles={tiles}
            onAddTile={addTile}
            onDuplicateTile={duplicateTile}
          />
        </Suspense>
      )}
    </div>
  )
}

export default Dashboard