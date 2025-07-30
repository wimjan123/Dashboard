import React, { useState, Suspense, useRef, useLayoutEffect } from 'react'
import { Rss, Cloud, CheckSquare, ExternalLink, Video, Maximize2, Minimize2, Expand, GripVertical, Bot, Gamepad2, MapPin, Plus, Edit, RotateCcw, X, Move, Save } from 'lucide-react'
import { lazy } from 'react'
import { useDynamicTiles } from '../hooks/useDynamicTiles'
import ThemeSelector from './ThemeSelector'
import { Resizable } from 're-resizable'
import Draggable from 'react-draggable'

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
    getTileClass,
    getSortedTiles,
    getFullscreenTile,
    toggleFullscreen,
    expandTile,
    resetTile,
    getAvailableTileTypes,
    resetToDefaults
  } = useDynamicTiles()

  // Store tile sizes and positions in state
  const [tilePositions, setTilePositions] = useState<{ [id: string]: { x: number; y: number } }>(() => {
    const saved = localStorage.getItem('dashboard-tile-positions')
    return saved ? JSON.parse(saved) : {}
  })

  const [tileSizes, setTileSizes] = useState<{ [id: string]: { width: number; height: number } }>(() => {
    const saved = localStorage.getItem('dashboard-tile-sizes')
    return saved ? JSON.parse(saved) : {}
  })

  const updateTilePosition = (id: string, x: number, y: number) => {
    setTilePositions(positions => {
      const updated = { ...positions, [id]: { x, y } }
      localStorage.setItem('dashboard-tile-positions', JSON.stringify(updated))
      return updated
    })
  }

  const updateTileSize = (id: string, width: number, height: number) => {
    setTileSizes(sizes => {
      const updated = { ...sizes, [id]: { width, height } }
      localStorage.setItem('dashboard-tile-sizes', JSON.stringify(updated))
      return updated
    })
  }

  const [showAddTile, setShowAddTile] = useState(false)
  const tileRefs = useRef<{ [id: string]: HTMLDivElement | null }>({})
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Calculate actual positions of tiles from their current DOM layout
  const calculateTilePositions = () => {
    if (!containerRef.current) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const newPositions: { [id: string]: { x: number; y: number } } = {}
    
    getSortedTiles().forEach(tile => {
      const tileElement = tileRefs.current[tile.id]
      if (tileElement) {
        const tileRect = tileElement.getBoundingClientRect()
        newPositions[tile.id] = {
          x: tileRect.left - containerRect.left,
          y: tileRect.top - containerRect.top
        }
      }
    })
    
    setTilePositions(positions => {
      const updated = { ...positions, ...newPositions }
      localStorage.setItem('dashboard-tile-positions', JSON.stringify(updated))
      return updated
    })
  }

  // When entering edit mode, capture current positions to prevent jumping
  useLayoutEffect(() => {
    if (editMode) {
      calculateTilePositions()
    }
  }, [editMode])
  
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
              title="Drag to move"
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
    // Only use saved positions in edit mode, let CSS grid handle normal mode
    const position = editMode ? (tilePositions[tileId] || { x: 0, y: 0 }) : { x: 0, y: 0 }
    const size = tileSizes[tileId] || { width: 400, height: 350 }

    const TileContent = () => (
      <Resizable
        size={{ width: size.width, height: size.height }}
        minWidth={250}
        minHeight={200}
        maxWidth={1200}
        maxHeight={800}
        enable={editMode ? {
          top: true, right: true, bottom: true, left: true, 
          topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
        } : false}
        onResizeStop={(_, __, ref) => {
          if (editMode) {
            updateTileSize(tileId, ref.offsetWidth, ref.offsetHeight)
          }
        }}
        className={`
          ${getTileClass(tileId)} 
          glass-effect rounded-2xl p-6 animate-slide-up flex flex-col 
          transition-all duration-300 group
          ${editMode ? 'border-2 border-blue-400/30 shadow-lg' : ''}
          ${fullscreenTile?.id === tileId ? 'fixed inset-4 z-50 !w-full !h-full' : ''}
        `}
        style={{ animationDelay }}
        handleWrapperClass={editMode ? "z-50" : "hidden"}
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
      </Resizable>
    )

    if (editMode) {
      return (
        <Draggable
          position={position}
          onStop={(_, data) => updateTilePosition(tileId, data.x, data.y)}
          handle=".drag-handle"
          bounds="parent"
        >
          <div className="absolute">
            <TileContent />
          </div>
        </Draggable>
      )
    }

    return <TileContent />
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
              🎯 Edit Mode Active - Drag tiles by their handle, resize from corners, modify settings
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

      {/* Dashboard Layout */}
      <div 
        ref={containerRef} 
        className={`relative px-6 pb-20 ${editMode ? 'min-h-[800px]' : ''}`}
      >
        {editMode ? (
          // Edit Mode: Absolute positioning with drag and resize
          <div className="relative">
            {getSortedTiles().map((tile, index) => {
              const animationDelay = `${index * 0.1}s`
              return (
                <TileComponent
                  key={tile.id}
                  tileId={tile.id}
                  icon={getTileIcon(tile.type)}
                  title={tile.title}
                  color={getTileColor(tile.type)}
                  component={renderTileContent(tile.type)}
                  animationDelay={animationDelay}
                />
              )
            })}
          </div>
        ) : (
          // Normal Mode: Grid layout
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
        )}
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