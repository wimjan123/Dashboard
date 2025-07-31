import React, { useState, Suspense } from 'react'
import { Rss, Cloud, CheckSquare, ExternalLink, Video, Bot, Gamepad2, MapPin, Plus, Edit, RotateCcw, X, Expand, Monitor, Calendar as CalendarIcon, Music, Wifi, Image, FileText, Layout } from 'lucide-react'
import { lazy } from 'react'
import { useDynamicTiles } from '../hooks/useDynamicTiles'
import ThemeSelector from './ThemeSelector'
import LayoutPresets from './LayoutPresets'

const NewsFeeds = lazy(() => import('./NewsFeeds'))
const WeatherWidget = lazy(() => import('./WeatherWidget'))
const TodoList = lazy(() => import('./TodoList'))
const Shortcuts = lazy(() => import('./Shortcuts'))
const Livestreams = lazy(() => import('./Livestreams'))
const AIChat = lazy(() => import('./AIChat'))
const Minigames = lazy(() => import('./Minigames'))
const TravelWidget = lazy(() => import('./TravelWidget'))
const SystemMonitor = lazy(() => import('./SystemMonitor'))
const Calendar = lazy(() => import('./Calendar'))
const MusicPlayer = lazy(() => import('./MusicPlayer'))
const NetworkMonitor = lazy(() => import('./NetworkMonitor'))
const ImageGallery = lazy(() => import('./ImageGallery'))
const Notes = lazy(() => import('./Notes'))
const AddTileModal = lazy(() => import('./AddTileModal'))

const Dashboard: React.FC = () => {
  const {
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
  } = useDynamicTiles()

  const [showAddTile, setShowAddTile] = useState(false)
  const [showLayoutPresets, setShowLayoutPresets] = useState(false)
  
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

  const renderTileContent = (type: string) => {
    switch (type) {
      case 'news': return <NewsFeeds />
      case 'weather': return <WeatherWidget />
      case 'todo': return <TodoList />
      case 'shortcuts': return <Shortcuts />
      case 'livestreams': return <Livestreams />
      case 'ai-chat': return <AIChat />
      case 'minigames': return <Minigames />
      case 'travel': return <TravelWidget />
      case 'system-monitor': return <SystemMonitor />
      case 'calendar': return <Calendar />
      case 'music-player': return <MusicPlayer />
      case 'network-monitor': return <NetworkMonitor />
      case 'image-gallery': return <ImageGallery />
      case 'notes': return <Notes />
      default: return <div>Unknown tile type</div>
    }
  }

  const getTileIcon = (type: string) => {
    switch (type) {
      case 'news': return <Rss className="w-4 h-4" />
      case 'weather': return <Cloud className="w-4 h-4" />
      case 'todo': return <CheckSquare className="w-4 h-4" />
      case 'shortcuts': return <ExternalLink className="w-4 h-4" />
      case 'livestreams': return <Video className="w-4 h-4" />
      case 'ai-chat': return <Bot className="w-4 h-4" />
      case 'minigames': return <Gamepad2 className="w-4 h-4" />
      case 'travel': return <MapPin className="w-4 h-4" />
      case 'system-monitor': return <Monitor className="w-4 h-4" />
      case 'calendar': return <CalendarIcon className="w-4 h-4" />
      case 'music-player': return <Music className="w-4 h-4" />
      case 'network-monitor': return <Wifi className="w-4 h-4" />
      case 'image-gallery': return <Image className="w-4 h-4" />
      case 'notes': return <FileText className="w-4 h-4" />
      default: return <ExternalLink className="w-4 h-4" />
    }
  }

  const getTileColor = (type: string) => {
    const tileType = TILE_TYPES.find(t => t.type === type)
    return tileType?.color || 'text-gray-400'
  }

  const TileComponent: React.FC<{
    tile: typeof tiles[0]
  }> = ({ tile }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [titleValue, setTitleValue] = useState(tile.title)

    const handleTitleSave = () => {
      if (titleValue.trim() !== tile.title) {
        updateTile(tile.id, { title: titleValue.trim() })
      }
      setIsEditingTitle(false)
    }

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleTitleSave()
      } else if (e.key === 'Escape') {
        setTitleValue(tile.title)
        setIsEditingTitle(false)
      }
    }

    return (
      <div className={`
        ${getTileStyleClasses(tile)}
        ${getTileClass(tile.id)}
        ${editMode ? 'border-2 border-blue-400/30 hover:border-blue-400/50' : 'border border-transparent hover:border-white/10'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className={`${getTileColor(tile.type)} flex-shrink-0`}>
              {getTileIcon(tile.type)}
            </div>
            {isEditingTitle ? (
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="flex-1 bg-transparent border-b border-blue-400 text-dark-text text-sm font-semibold focus:outline-none"
                autoFocus
              />
            ) : (
              <h3 
                className={`text-sm font-semibold ${getTileColor(tile.type)} truncate ${editMode ? 'cursor-pointer hover:text-opacity-80' : ''}`}
                onClick={() => editMode && setIsEditingTitle(true)}
                title={editMode ? "Click to edit title" : tile.title}
              >
                {tile.title}
              </h3>
            )}
          </div>
          
          {editMode && (
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => changeTileSize(tile.id)}
                className="text-dark-text-secondary hover:text-green-400 transition-colors duration-200 p-1 rounded hover:bg-dark-border"
                title={`Resize tile (currently ${tile.size})`}
              >
                <Expand className="w-3 h-3" />
              </button>
              <button
                onClick={() => removeTile(tile.id)}
                className="text-dark-text-secondary hover:text-red-400 transition-colors duration-200 p-1 rounded hover:bg-dark-border"
                title="Remove tile"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="tile-content overflow-y-auto scrollbar-thin">
            {renderTileContent(tile.type)}
          </div>
        </div>

        {/* Size indicator */}
        {editMode && (
          <div className="absolute top-1 right-1 text-white text-xs px-2 py-1 rounded-md bg-blue-500/75">
            {tile.size.toUpperCase()}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-slate-900">
      {/* Header */}
      <div className="mb-4 text-center animate-fade-in p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddTile(true)}
              className="p-2 rounded-lg bg-green-500 hover:bg-green-600 transition-colors duration-200"
              title="Add tile"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
            
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                editMode 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' 
                  : 'bg-dark-card hover:bg-dark-border text-dark-text'
              }`}
              title={editMode ? "Exit edit mode" : "Enter edit mode"}
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm font-medium">{editMode ? 'Save' : 'Edit'}</span>
            </button>

            {editMode && (
              <>
                <button
                  onClick={() => setShowLayoutPresets(!showLayoutPresets)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    showLayoutPresets
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                  title="Layout presets"
                >
                  <Layout className="w-4 h-4" />
                </button>
                <button
                  onClick={resetToDefaults}
                  className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors duration-200"
                  title="Reset to default layout"
                >
                  <RotateCcw className="w-4 h-4 text-white" />
                </button>
              </>
            )}
          </div>
          
          <ThemeSelector />
        </div>
        
        {editMode && (
          <div className="mb-4 space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-xl">
              <p className="text-blue-400 text-sm font-medium text-center mb-2">
                🎯 Edit Mode Active
              </p>
              <div className="text-blue-300 text-xs text-center">
                <div>• Click expand button (⤢) to cycle tile sizes: small → medium → large</div>
                <div>• Click tile titles to rename them</div>
                <div>• Click X to remove tiles</div>
              </div>
            </div>
            
            {showLayoutPresets && (
              <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
                <LayoutPresets
                  globalSettings={globalSettings}
                  onUpdateGlobalSettings={updateGlobalSettings}
                />
              </div>
            )}
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-dark-text mb-1 tracking-wide">
          {currentTime}
        </h1>
        <p className="text-dark-text-secondary text-base">
          {currentDate}
        </p>
      </div>

      {/* Tiles Grid */}
      <div className="px-6 pb-6">
        <div className={getGridClasses()}>
          {tiles.map((tile) => (
            <Suspense 
              key={tile.id} 
              fallback={
                <div className={`${getTileClass(tile.id)} glass-effect rounded-2xl p-6 flex items-center justify-center`}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              }
            >
              <TileComponent tile={tile} />
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
            onDuplicateTile={() => {}} // Not needed in simple version
          />
        </Suspense>
      )}
    </div>
  )
}

export default Dashboard
