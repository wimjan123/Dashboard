import React from 'react'
import { Rss, Cloud, CheckSquare, ExternalLink, Video, Maximize2, Minimize2, Expand, GripVertical, Bot, Gamepad2 } from 'lucide-react'
import NewsFeeds from './NewsFeeds'
import WeatherWidget from './WeatherWidget'
import TodoList from './TodoList'
import Shortcuts from './Shortcuts'
import Livestreams from './Livestreams'
import AIChat from './AIChat'
import Minigames from './Minigames'
import { useTileExpansion } from '../hooks/useTileExpansion'

const Dashboard: React.FC = () => {
  const { 
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
  } = useTileExpansion()
  
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
  }> = ({ tileId, icon, title, color }) => (
    <div className="flex items-center justify-between mb-4 flex-shrink-0">
      <div className="flex items-center">
        <button
          className="mr-2 p-1 rounded hover:bg-dark-border transition-colors duration-200 text-dark-text-secondary hover:text-dark-text cursor-grab active:cursor-grabbing"
          draggable
          onDragStart={() => handleDragStart(tileId)}
          onDragEnd={handleDragEnd}
          title="Drag to rearrange"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className={`w-6 h-6 mr-3 ${color}`}>{icon}</span>
        <h2 className="text-xl font-semibold text-dark-text">{title}</h2>
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => expandTile(tileId)}
          className="p-1 rounded hover:bg-dark-border transition-colors duration-200 text-dark-text-secondary hover:text-dark-text"
          title="Cycle tile size"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => toggleFullscreen(tileId)}
          className="p-1 rounded hover:bg-dark-border transition-colors duration-200 text-dark-text-secondary hover:text-dark-text"
          title="Toggle fullscreen"
        >
          <Expand className="w-4 h-4" />
        </button>
        {(tiles[tileId]?.size !== 'normal' || tiles[tileId]?.isFullscreen) && (
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

  const fullscreenTile = getFullscreenTile()

  const TileComponent: React.FC<{ 
    tileId: string, 
    icon: React.ReactNode, 
    title: string, 
    color: string,
    component: React.ReactNode,
    animationDelay?: string
  }> = ({ tileId, icon, title, color, component, animationDelay = '0s' }) => (
    <div 
      className={`${getTileClass(tileId)} glass-effect rounded-2xl p-6 hover-lift animate-slide-up flex flex-col transition-all duration-300 ${
        draggedTile === tileId ? 'opacity-50 scale-95' : ''
      } ${
        fullscreenTile?.id === tileId ? 'fixed inset-4 z-50 !col-span-12 !row-span-1 h-[calc(100vh-2rem)]' : ''
      }`}
      style={{ animationDelay }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => handleDrop(tileId)}
    >
      <TileHeader 
        tileId={tileId} 
        icon={icon} 
        title={title} 
        color={color} 
      />
      <div className="flex-1 overflow-hidden">
        {component}
      </div>
    </div>
  )

  if (fullscreenTile) {
    // Render only the fullscreen tile
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-slate-900">
        {fullscreenTile.id === 'news' && (
          <TileComponent
            tileId="news"
            icon={<Rss className="w-6 h-6" />}
            title="News Feeds"
            color="text-blue-400"
            component={<NewsFeeds />}
          />
        )}
        {fullscreenTile.id === 'weather' && (
          <TileComponent
            tileId="weather"
            icon={<Cloud className="w-6 h-6" />}
            title="Weather"
            color="text-sky-400"
            component={<WeatherWidget />}
          />
        )}
        {fullscreenTile.id === 'todo' && (
          <TileComponent
            tileId="todo"
            icon={<CheckSquare className="w-6 h-6" />}
            title="Tasks"
            color="text-green-400"
            component={<TodoList />}
          />
        )}
        {fullscreenTile.id === 'shortcuts' && (
          <TileComponent
            tileId="shortcuts"
            icon={<ExternalLink className="w-6 h-6" />}
            title="Quick Access"
            color="text-purple-400"
            component={<Shortcuts />}
          />
        )}
        {fullscreenTile.id === 'livestreams' && (
          <TileComponent
            tileId="livestreams"
            icon={<Video className="w-6 h-6" />}
            title="Live Streams"
            color="text-red-400"
            component={<Livestreams />}
          />
        )}
        {fullscreenTile.id === 'ai-chat' && (
          <TileComponent
            tileId="ai-chat"
            icon={<Bot className="w-6 h-6" />}
            title="AI Assistant"
            color="text-blue-400"
            component={<AIChat />}
          />
        )}
        {fullscreenTile.id === 'minigames' && (
          <TileComponent
            tileId="minigames"
            icon={<Gamepad2 className="w-6 h-6" />}
            title="Mini Games"
            color="text-purple-400"
            component={<Minigames />}
          />
        )}
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-slate-900">
      {/* Header */}
      <div className="mb-8 text-center animate-fade-in p-6">
        <h1 className="text-4xl font-bold text-dark-text mb-2 tracking-wide">
          {currentTime}
        </h1>
        <p className="text-dark-text-secondary text-lg">
          {currentDate}
        </p>
      </div>

      {/* Scrollable Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6 px-6 pb-20" style={{ gridAutoRows: 'minmax(300px, auto)' }}>
        {getSortedTiles().map((tile, index) => {
          const animationDelay = `${index * 0.1}s`
          
          if (tile.id === 'news') {
            return (
              <TileComponent
                key={tile.id}
                tileId="news"
                icon={<Rss className="w-6 h-6" />}
                title="News Feeds"
                color="text-blue-400"
                component={<NewsFeeds />}
                animationDelay={animationDelay}
              />
            )
          }
          
          if (tile.id === 'weather') {
            return (
              <TileComponent
                key={tile.id}
                tileId="weather"
                icon={<Cloud className="w-6 h-6" />}
                title="Weather"
                color="text-sky-400"
                component={<WeatherWidget />}
                animationDelay={animationDelay}
              />
            )
          }
          
          if (tile.id === 'todo') {
            return (
              <TileComponent
                key={tile.id}
                tileId="todo"
                icon={<CheckSquare className="w-6 h-6" />}
                title="Tasks"
                color="text-green-400"
                component={<TodoList />}
                animationDelay={animationDelay}
              />
            )
          }
          
          if (tile.id === 'shortcuts') {
            return (
              <TileComponent
                key={tile.id}
                tileId="shortcuts"
                icon={<ExternalLink className="w-6 h-6" />}
                title="Quick Access"
                color="text-purple-400"
                component={<Shortcuts />}
                animationDelay={animationDelay}
              />
            )
          }
          
          if (tile.id === 'livestreams') {
            return (
              <TileComponent
                key={tile.id}
                tileId="livestreams"
                icon={<Video className="w-6 h-6" />}
                title="Live Streams"
                color="text-red-400"
                component={<Livestreams />}
                animationDelay={animationDelay}
              />
            )
          }
          
          if (tile.id === 'ai-chat') {
            return (
              <TileComponent
                key={tile.id}
                tileId="ai-chat"
                icon={<Bot className="w-6 h-6" />}
                title="AI Assistant"
                color="text-blue-400"
                component={<AIChat />}
                animationDelay={animationDelay}
              />
            )
          }
          
          if (tile.id === 'minigames') {
            return (
              <TileComponent
                key={tile.id}
                tileId="minigames"
                icon={<Gamepad2 className="w-6 h-6" />}
                title="Mini Games"
                color="text-purple-400"
                component={<Minigames />}
                animationDelay={animationDelay}
              />
            )
          }
          
          return null
        })}
      </div>
    </div>
  )
}

export default Dashboard