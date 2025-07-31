import React, { useState, Suspense, useRef, useCallback } from 'react'
import { ResizableBox } from 'react-resizable'
import 'react-resizable/css/styles.css'
import { Rss, Cloud, CheckSquare, ExternalLink, Video, Maximize2, Minimize2, Expand, GripVertical, Bot, Gamepad2, MapPin, Plus, Edit, RotateCcw, X, Save, Move, Grid3X3 } from 'lucide-react'
import { lazy } from 'react'
import { useDynamicTiles, COLUMN_WIDTHS, GRID_CONFIG, TileColumns } from '../hooks/useDynamicTiles'
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
    resetToDefaults,
    updateTilePosition,
    COLUMN_WIDTHS,
    GRID_CONFIG
  } = useDynamicTiles()


  const [showAddTile, setShowAddTile] = useState(false)
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null)
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null)
  const [tileSizes, setTileSizes] = useState<{ [id: string]: { width: number; height: number } }>({})
  const [gridMode, setGridMode] = useState(false)
  const tileRefs = useRef<{ [id: string]: HTMLDivElement | null }>({})
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleResize = (tileId: string) => (e: any, { size }: { size: { width: number; height: number } }) => {
    setTileSizes(prev => ({
      ...prev,
      [tileId]: size
    }))
  }


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
            <button 
              className="grip-handle mr-2 p-1 cursor-pointer hover:bg-dark-border rounded transition-colors duration-200"
              title={selectedTileId === tileId ? "Click to deselect" : selectedTileId ? "Click to swap here" : "Click to select"}
              onClick={(e) => handleTileSelect(tileId, e)}
            >
              <GripVertical 
                className={`w-4 h-4 transition-colors duration-200 ${
                  selectedTileId === tileId 
                    ? 'text-blue-400' 
                    : selectedTileId && selectedTileId !== tileId
                    ? 'text-green-400 hover:text-green-300'
                    : 'text-dark-text-secondary hover:text-dark-text'
                }`}
              />
            </button>
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
                value={tile.columns}
                onChange={(e) => {
                  const columns = parseInt(e.target.value) as TileColumns;
                  updateTile(tileId, { columns });
                }}
                className="text-xs px-2 py-1 bg-dark-bg border border-dark-border rounded text-dark-text focus:outline-none focus:border-blue-400"
                title="Tile width"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
                <option value={5}>5 Columns</option>
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
          {!editMode && ((tile.columns !== 3 || tile.height !== GRID_CONFIG.defaultTileHeight) || tile.isFullscreen) && (
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
    const isSelected = selectedTileId === tileId
    const isTargetAvailable = selectedTileId && selectedTileId !== tileId
    const tile = tiles.find(t => t.id === tileId)

    if (!tile) return null

    const getTileWidth = () => {
      const containerWidth = 1200 // Base container width
      const gap = GRID_CONFIG.gap
      const availableWidth = containerWidth - (gap * 5) // 4 gaps for 5 columns max
      return Math.floor((availableWidth * tile.columns) / 12) // 12-column grid
    }

    const handleColumnChange = (columns: TileColumns) => {
      updateTile(tileId, { columns })
    }

    if (editMode && !fullscreenTile) {
      const tileWidth = getTileWidth()
      const currentSize = tileSizes[tileId] || { width: tileWidth, height: tile.height }
      
      return (
        <ResizableBox
          width={currentSize.width}
          height={currentSize.height}
          minConstraints={[COLUMN_WIDTHS[2].minWidth, GRID_CONFIG.minTileHeight]}
          maxConstraints={[COLUMN_WIDTHS[5].baseWidth, 800]}
          resizeHandles={['se', 's', 'e']}
          handle={
            <div className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize group">
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-blue-500 hover:bg-blue-400 rounded-tl-lg flex items-end justify-end transition-colors duration-200">
                <Move className="w-2 h-2 text-white m-0.5" />
              </div>
            </div>
          }
          onResize={handleResize(tileId)}
          onResizeStop={(e, data) => {
            handleResize(tileId)(e, data)
            let newHeight = data.size.height
            
            // Snap to grid if enabled
            if (gridMode) {
              newHeight = Math.round(newHeight / GRID_CONFIG.gap) * GRID_CONFIG.gap
            }
            
            // Determine columns based on width
            let newColumns: TileColumns = 3
            const width = data.size.width
            if (width >= COLUMN_WIDTHS[5].minWidth) newColumns = 5
            else if (width >= COLUMN_WIDTHS[4].minWidth) newColumns = 4
            else if (width >= COLUMN_WIDTHS[3].minWidth) newColumns = 3
            else newColumns = 2
            
            updateTile(tileId, { columns: newColumns, height: newHeight })
          }}
          className="group relative"
        >
          <div
            className={`
              glass-effect rounded-2xl p-6 animate-slide-up flex flex-col 
              transition-all duration-300 h-full relative
              ${isSelected 
                ? 'border-2 border-blue-500 shadow-lg shadow-blue-500/25 bg-blue-500/10 scale-105' 
                : 'border-2 border-blue-400/30 hover:border-blue-400/50'
              }
              ${isTargetAvailable && !isSelected
                ? 'border-green-400/50 hover:border-green-400 hover:bg-green-400/5 cursor-pointer' 
                : ''
              }
            `}
            style={{ animationDelay, width: '100%', height: '100%' }}
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
            
            {/* Enhanced Edit Mode Indicators */}
            {editMode && (
              <>
                <div className={`absolute top-1 right-1 text-white text-xs px-2 py-1 rounded-md transition-all duration-200 ${
                  isSelected ? 'bg-blue-500 shadow-lg' : 'bg-blue-500/75'
                }`}>
                  {isSelected ? 'SELECTED' : `${tile.columns} COL`}
                </div>
                
                {/* Column adjustment buttons */}
                <div className="absolute top-1 left-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {[2, 3, 4, 5].map(cols => (
                    <button
                      key={cols}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleColumnChange(cols as TileColumns)
                      }}
                      className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center transition-all duration-200 ${
                        tile.columns === cols
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                      }`}
                      title={`${cols} columns`}
                    >
                      {cols}
                    </button>
                  ))}
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
        </ResizableBox>
      )
    }

    // Non-edit mode or fullscreen tile
    return (
      <div
        className={`
          glass-effect rounded-2xl p-6 animate-slide-up flex flex-col 
          transition-all duration-300 group h-full relative
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
        style={{ 
          animationDelay,
          width: editMode ? `${getTileWidth()}px` : 'auto',
          height: editMode ? `${tile.height}px` : 'auto'
        }}
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
              {isSelected ? 'SELECTED' : `${tile.columns} COL`}
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
              <>
                <button
                  onClick={() => setGridMode(!gridMode)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    gridMode 
                      ? 'bg-purple-500 hover:bg-purple-600 shadow-lg' 
                      : 'bg-dark-card hover:bg-dark-border'
                  }`}
                  title={gridMode ? "Disable snap-to-grid" : "Enable snap-to-grid"}
                >
                  <Grid3X3 className={`w-4 h-4 ${gridMode ? 'text-white' : 'text-dark-text-secondary'}`} />
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
                <div>• Drag corners to resize tiles</div>
                <div>• Use column buttons (2,3,4,5) for width</div>
                <div>• Click titles to rename them</div>
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

      {/* Dashboard Layout - Column-Based Grid System */}
      <div 
        ref={containerRef} 
        className="px-6 pb-20 relative"
        onClick={handleClickOutside}
      >
        {editMode ? (
          // Edit mode - Smart positioning with collision detection
          <div 
            className="relative min-h-screen"
            style={{
              backgroundImage: gridMode ? `
                linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              ` : 'none',
              backgroundSize: gridMode ? `${GRID_CONFIG.gap}px ${GRID_CONFIG.gap}px` : 'auto'
            }}
          >
            {getSortedTiles().map((tile, index) => {
              const animationDelay = `${index * 0.1}s`
              
              // Calculate position with collision avoidance
              const getTilePosition = () => {
                if (tile.x !== undefined && tile.y !== undefined) {
                  return { x: tile.x, y: tile.y }
                }
                
                // Auto-position with collision detection
                const tileWidth = COLUMN_WIDTHS[tile.columns].baseWidth
                const maxX = 1200 - tileWidth - GRID_CONFIG.gap
                const row = Math.floor(index / 3)
                const col = index % 3
                
                return {
                  x: Math.min(col * (tileWidth + GRID_CONFIG.gap), maxX),
                  y: row * (tile.height + GRID_CONFIG.gap)
                }
              }
              
              const position = getTilePosition()
              
              return (
                <div 
                  key={tile.id}
                  ref={el => tileRefs.current[tile.id] = el}
                  className="absolute transition-all duration-300 ease-out"
                  style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    zIndex: selectedTileId === tile.id ? 100 : 10
                  }}
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
        ) : (
          // Normal mode - Responsive CSS Grid with column spans
          <div 
            className="grid gap-6"
            style={{ 
              gridTemplateColumns: 'repeat(12, 1fr)',
              gridAutoRows: 'minmax(250px, auto)'
            }}
          >
            {getSortedTiles().map((tile, index) => {
              const animationDelay = `${index * 0.1}s`
              const columnSpan = Math.round((tile.columns * 12) / 5) // Map to 12-column grid
              
              return (
                <div 
                  key={tile.id}
                  ref={el => tileRefs.current[tile.id] = el}
                  className={`col-span-${Math.min(columnSpan, 12)}`}
                  style={{ 
                    minHeight: `${tile.height}px`,
                    gridRowEnd: `span ${Math.ceil(tile.height / 250)}`
                  }}
                  onClick={(e) => e.stopPropagation()}
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
