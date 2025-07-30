import React, { useState, Suspense, useRef } from 'react'
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
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null)
  const [dragOverTileId, setDragOverTileId] = useState<string | null>(null)
  const tileRefs = useRef<{ [id: string]: HTMLDivElement | null }>({})
  const containerRef = useRef<HTMLDivElement | null>(null)


  // Drag and drop handlers for grid rearrangement
  const handleDragStart = (tileId: string) => {
    if (!editMode) return
    setDraggedTileId(tileId)
  }

  const handleDragEnd = () => {
    setDraggedTileId(null)
    setDragOverTileId(null)
  }

  const handleDragOver = (e: React.DragEvent, tileId: string) => {
    e.preventDefault()
    if (!editMode) return
    setDragOverTileId(tileId)
  }

  const handleDragLeave = () => {
    setDragOverTileId(null)
  }

  const handleDrop = (e: React.DragEvent, targetTileId: string) => {
    e.preventDefault()
    if (!editMode || !draggedTileId || draggedTileId === targetTileId) return
    
    reorderTiles(draggedTileId, targetTileId)
    setDraggedTileId(null)
    setDragOverTileId(null)
  }

  
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

  const TileHeader: React.FC<{ 
    tileId: string, 
    icon: React.ReactNode, 
    title: string, 
    color: string 
  }> = ({ tileId, icon, title, color }) => {
    const tile = tiles.find(t => t.id === tileId)
    if (!tile) return null

    return (
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center">
          {editMode && (
            <div 
              className="drag-handle mr-2 p-1 cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GripVertical 
                className="w-4 h-4 text-dark-text-secondary hover:text-dark-text transition-colors duration-200" 
              />
            </div>
          )}
          <span className={`w-6 h-6 mr-3 ${color}`}>{icon}</span>
          {editMode ? (
            <input
              type="text"
              value={title}
              onChange={(e) => updateTile(tileId, { title: e.target.value })}
              className="text-xl font-semibold bg-transparent text-dark-text border-b border-dark-border focus:outline-none focus:border-blue-400"
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <h2 className="text-xl font-semibold text-dark-text">{title}</h2>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {editMode && (
            <>
              <select
                value={tile.size}
                onChange={(e) => updateTile(tileId, { size: e.target.value as any })}
                className="text-xs px-2 py-1 bg-dark-bg border border-dark-border rounded text-dark-text focus:outline-none focus:border-blue-400"
                title="Tile size"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
              <button
                onClick={() => removeTile(tileId)}
                className="p-1 rounded hover:bg-red-500/20 transition-colors duration-200 text-red-400 hover:text-red-300"
                title="Remove tile"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          {!editMode && (
            <button
              onClick={() => expandTile(tileId)}
              className="p-1 rounded hover:bg-dark-border transition-colors duration-200 text-dark-text-secondary hover:text-dark-text"
              title="Cycle tile size"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => toggleFullscreen(tileId)}
            className="p-1 rounded hover:bg-dark-border transition-colors duration-200 text-dark-text-secondary hover:text-dark-text"
            title="Toggle fullscreen"
          >
            <Expand className="w-4 h-4" />
          </button>
          {!editMode && (tile.size !== 'normal' || tile.isFullscreen) && (
            <button
              onClick={() => resetTile(tileId)}
              className="p-1 rounded hover:bg-dark-border transition-colors duration-200 text-dark-text-secondary hover:text-dark-text"
              title="Reset tile"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  const fullscreenTile = getFullscreenTile()

  const renderTileContent = (tileType: string) => {
    const content = (() => {
      switch (tileType) {
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
          return <div className="text-dark-text-secondary">Unknown tile type</div>
      }
    })()

    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
        </div>
      }>
        {content}
      </Suspense>
    )
  }

  const getTileIcon = (tileType: string) => {
    const iconMap = {
      'news': <Rss className="w-6 h-6" />,
      'weather': <Cloud className="w-6 h-6" />,
      'todo': <CheckSquare className="w-6 h-6" />,
      'shortcuts': <ExternalLink className="w-6 h-6" />,
      'livestreams': <Video className="w-6 h-6" />,
      'ai-chat': <Bot className="w-6 h-6" />,
      'minigames': <Gamepad2 className="w-6 h-6" />,
      'travel': <MapPin className="w-6 h-6" />
    }
    return iconMap[tileType as keyof typeof iconMap] || <div className="w-6 h-6" />
  }

  const getTileColor = (tileType: string) => {
    const colorMap = {
      'news': 'text-blue-400',
      'weather': 'text-sky-400', 
      'todo': 'text-green-400',
      'shortcuts': 'text-purple-400',
      'livestreams': 'text-red-400',
      'ai-chat': 'text-blue-400',
      'minigames': 'text-purple-400',
      'travel': 'text-orange-400'
    }
    return colorMap[tileType as keyof typeof colorMap] || 'text-gray-400'
  }

  const TileComponent: React.FC<{ 
    tileId: string, 
    icon: React.ReactNode, 
    title: string, 
    color: string,
    component: React.ReactNode,
    animationDelay?: string
  }> = ({ tileId, icon, title, color, component, animationDelay = '0s' }) => {
    const isDraggedOver = dragOverTileId === tileId
    const isDragging = draggedTileId === tileId

    return (
      <div
        draggable={editMode}
        onDragStart={() => handleDragStart(tileId)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, tileId)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, tileId)}
        className={`
          glass-effect rounded-2xl p-6 animate-slide-up flex flex-col 
          transition-all duration-300 group h-full
          ${editMode ? 'border-2 border-blue-400/30 shadow-lg cursor-move' : ''}
          ${isDraggedOver && editMode ? 'border-green-400 bg-green-400/10' : ''}
          ${isDragging ? 'opacity-50 scale-95' : ''}
          ${fullscreenTile?.id === tileId ? 'fixed inset-4 z-50 !w-full !h-full' : ''}
        `}
        style={{ animationDelay }}
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
        
        {/* Edit Mode Indicator */}
        {editMode && (
          <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-75">
            EDIT
          </div>
        )}
        
        {/* Drag overlay indicator */}
        {isDraggedOver && editMode && (
          <div className="absolute inset-0 border-2 border-dashed border-green-400 rounded-2xl bg-green-400/5 flex items-center justify-center">
            <span className="text-green-400 font-medium">Drop here to reorder</span>
          </div>
        )}
      </div>
    )
  }

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
    <div className="w-full min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-slate-900">
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
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
            <p className="text-blue-400 text-sm font-medium text-center">
              🎯 Edit Mode Active - Drag tiles to reorder them in the grid, modify tile settings
            </p>
          </div>
        )}
        
        <h1 className="text-4xl font-bold text-dark-text mb-2 tracking-wide">
          {currentTime}
        </h1>
        <p className="text-dark-text-secondary text-lg">
          {currentDate}
        </p>
      </div>

      {/* Dashboard Layout - Unified Grid System */}
      <div 
        ref={containerRef} 
        className="px-6 pb-20"
      >
        <div 
          className="grid grid-cols-12 gap-6"
          style={{ gridAutoRows: 'minmax(250px, auto)' }}
        >
          {getSortedTiles().map((tile, index) => {
            const animationDelay = `${index * 0.1}s`
            return (
              <div 
                key={tile.id}
                ref={el => tileRefs.current[tile.id] = el}
                className={getTileClass(tile.id)}
              >
                <TileComponent
                  tileId={tile.id}
                  icon={getTileIcon(tile.type)}
                  title={tile.title}
                  color={getTileColor(tile.type)}
                  component={renderTileContent(tile.type)}
                  animationDelay={animationDelay}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Tile Modal */}
      <AddTileModal
        isOpen={showAddTile}
        onClose={() => setShowAddTile(false)}
        availableTileTypes={getAvailableTileTypes()}
        existingTiles={tiles.map(t => ({ id: t.id, type: t.type, title: t.title }))}
        onAddTile={addTile}
        onDuplicateTile={duplicateTile}
      />
    </div>
  )
}

export default Dashboard