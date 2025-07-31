import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, Image as ImageIcon, Folder, Settings } from 'lucide-react'

interface GalleryImage {
  id: string
  url: string
  title: string
  description?: string
}

const ImageGallery: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [autoPlayInterval, setAutoPlayInterval] = useState(5000)
  const [showSettings, setShowSettings] = useState(false)

  // Mock images - in a real app, these would be loaded from local folders
  const images: GalleryImage[] = [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      title: 'Mountain Landscape',
      description: 'Beautiful mountain vista at sunset'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      title: 'Forest Path',
      description: 'Peaceful forest trail in autumn'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
      title: 'Ocean Waves',
      description: 'Coastal scenery with dramatic waves'
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
      title: 'Starry Night',
      description: 'Night sky filled with stars'
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=800&h=600&fit=crop',
      title: 'Desert Sunset',
      description: 'Golden hour in the desert'
    }
  ]

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isAutoPlay, autoPlayInterval, images.length])

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const currentImage = images[currentIndex]

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Folder className="w-12 h-12 mb-3 text-violet-400 opacity-50" />
        <p className="text-dark-text-secondary mb-2">No images found</p>
        <button className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm rounded-lg transition-colors duration-200">
          Select Folder
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Gallery Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-dark-text">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isAutoPlay 
                ? 'text-violet-400 bg-violet-400/20' 
                : 'text-dark-text-secondary hover:text-dark-text'
            }`}
            title={isAutoPlay ? 'Pause slideshow' : 'Start slideshow'}
          >
            {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full text-dark-text-secondary hover:text-dark-text transition-colors duration-200"
            title="Settings"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 bg-dark-card rounded-lg border border-dark-border">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-dark-text-secondary mb-1">
                Auto-play interval
              </label>
              <select
                value={autoPlayInterval}
                onChange={(e) => setAutoPlayInterval(Number(e.target.value))}
                className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-xs text-dark-text"
              >
                <option value={3000}>3 seconds</option>
                <option value={5000}>5 seconds</option>
                <option value={10000}>10 seconds</option>
                <option value={15000}>15 seconds</option>
              </select>
            </div>
            <button className="w-full px-3 py-2 bg-violet-500 hover:bg-violet-600 text-white text-xs rounded transition-colors duration-200">
              Change Folder
            </button>
          </div>
        </div>
      )}

      {/* Main Image Display */}
      <div className="relative aspect-video bg-dark-border rounded-lg overflow-hidden group">
        <img
          src={currentImage.url}
          alt={currentImage.title}
          className="w-full h-full object-cover transition-opacity duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMzAzNjNkIi8+CjxwYXRoIGQ9Ik00MCAzMEM0MiAzMCA0My41IDMxLjUgNDMuNSAzMy41QzQzLjUgMzUuNSA0MiAzNyA0MCAzN0MzOCAzNyAzNi41IDM1LjUgMzYuNSAzMy41QzM2LjUgMzEuNSAzOCAzMCA0MCAzMFoiIGZpbGw9IiM4Yjk0OWUiLz4KPHBhdGggZD0iTTI1IDQ1TDM1IDM1TDQ1IDQ1TDU1IDM1TDY1IDQ1SDE1TDI1IDQ1WiIgZmlsbD0iIzhiOTQ5ZSIvPgo8L3N2Zz4K'
          }}
        />
        
        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Image Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <h3 className="text-white font-medium text-sm">{currentImage.title}</h3>
          {currentImage.description && (
            <p className="text-white/80 text-xs mt-1">{currentImage.description}</p>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex space-x-1 overflow-x-auto scrollbar-thin pb-1">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => goToSlide(index)}
            className={`flex-shrink-0 w-12 h-8 rounded border-2 overflow-hidden transition-all duration-200 ${
              index === currentIndex 
                ? 'border-violet-400 opacity-100' 
                : 'border-transparent opacity-60 hover:opacity-80'
            }`}
          >
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery