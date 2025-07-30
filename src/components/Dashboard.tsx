import React, { useState, Suspense } from 'react'
import { Rss, Cloud, CheckSquare, ExternalLink, Video, Maximize2, Minimize2, Expand, GripVertical, Bot, Gamepad2, MapPin, Plus, Edit, RotateCcw, X, Move } from 'lucide-react'
import { lazy } from 'react'
import { useDynamicTiles } from '../hooks/useDynamicTiles'

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
    draggedTile,
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
    handleDragStart,
    handleDragEnd,
    handleDrop,
    getAvailableTileTypes,
    resetToDefaults
  } = useDynamicTiles()

  const [showAddTile, setShowAddTile] = useState(false)
  
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
          <button
            className="mr-2 p-1 rounded hover:bg-dark-border transition-colors duration-200 text-dark-text-secondary hover:text-dark-text cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={(e) => {
              handleDragStart(tileId)
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', tileId)
            }}
            onDragEnd={handleDragEnd}
            title="Drag to rearrange"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span className={`w-6 h-6 mr-3 ${color}`}>{icon}</span>
          {editMode ? (
            <input
              type="text"
              value={title}
              onChange={(e) => updateTile(tileId, { title: e.target.value })}
              className="text-xl font-semibold bg-transparent text-dark-text border-b border-dark-border focus:outline-none focus:border-blue-400"
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
          return <div className="text-center text-dark-text-secondary">Unknown tile type</div>
      }
    })()
    
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-full text-dark-text-secondary">Loading...</div>}>
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
  }> = ({ tileId, icon, title, color, component, animationDelay = '0s' }) => (
    <div 
      className={`${getTileClass(tileId)} glass-effect rounded-2xl p-6 hover-lift animate-slide-up flex flex-col transition-all duration-300 relative group ${
        draggedTile === tileId ? 'opacity-30 scale-95 rotate-2' : ''
      } ${
        fullscreenTile?.id === tileId ? 'fixed inset-4 z-50 !col-span-12 !row-span-1 h-[calc(100vh-2rem)]' : ''
      }`}
      style={{ animationDelay }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onDragEnter={(e) => {
        e.preventDefault()
        if (draggedTile && draggedTile !== tileId) {
          e.currentTarget.classList.add('ring-2', 'ring-blue-400', 'ring-opacity-50')
        }
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-50')
      }}
      onDrop={(e) => {
        e.preventDefault()
        e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-50')
        const droppedTileId = e.dataTransfer.getData('text/plain')
        if (droppedTileId) handleDrop(tileId)
      }}
    >
      <TileHeader 
        tileId={tileId} 
        icon={icon} 
        title={title} 
        color={color} 
      />
      <div className="flex-1 overflow-hidden min-h-0">
        {component}
      </div>
      
      {/* Resize Handle */}
      {!editMode && !fullscreenTile && (
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            className="p-1 rounded hover:bg-dark-border transition-colors duration-200 text-dark-text-secondary hover:text-dark-text cursor-nw-resize flex items-center space-x-1"
            onClick={() => expandTile(tileId)}
            title={`Resize tile (current: ${tiles.find(t => t.id === tileId)?.size || 'normal'})`}
          >
            <Move className="w-3 h-3" />
            <span className="text-xs capitalize">{tiles.find(t => t.id === tileId)?.size}</span>
          </button>
        </div>
      )}
    </div>
  )

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
            <button
              onClick={() => setEditMode(!editMode)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                editMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-dark-card hover:bg-opacity-80 text-dark-text-secondary hover:text-dark-text'
              }`}
              title="Edit layout"
            >
              <Edit className="w-4 h-4" />
            </button>
            {editMode && (
              <button
                onClick={resetToDefaults}
                className="p-2 rounded-lg bg-dark-card hover:bg-opacity-80 transition-colors duration-200 text-dark-text-secondary hover:text-dark-text"
                title="Reset to defaults"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {editMode && (
            <div className="text-sm text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">
              Edit Mode Active
            </div>
          )}
        </div>
        
        <h1 className="text-4xl font-bold text-dark-text mb-2 tracking-wide">
          {currentTime}
        </h1>
        <p className="text-dark-text-secondary text-lg">
          {currentDate}
        </p>
      </div>

      {/* Scrollable Dashboard Grid */}
      <div className={`grid grid-cols-12 gap-6 px-6 pb-20 ${editMode ? 'relative' : ''}`} style={{ gridAutoRows: 'minmax(300px, auto)' }}>
        {editMode && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-dashed border-blue-400/20"
                style={{ left: `${(i * 100) / 12}%` }}
              />
            ))}
          </div>
        )}
        
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