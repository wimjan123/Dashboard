import React, { useState, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat } from 'lucide-react'

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl?: string
}

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(75)
  const [isLiked, setIsLiked] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)

  const currentTrack: Track = {
    id: '1',
    title: 'Ambient Soundscape',
    artist: 'Lo-Fi Dreams',
    album: 'Focus Sessions',
    duration: 180, // 3 minutes
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentTrack.duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentTrack.duration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value)
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseInt(e.target.value))
  }

  const progress = (currentTime / currentTrack.duration) * 100

  return (
    <div className="space-y-4">
      {/* Album Art Placeholder */}
      <div className="aspect-square bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-pink-400/30">
        <div className="text-4xl">🎵</div>
      </div>

      {/* Track Info */}
      <div className="text-center space-y-1">
        <h3 className="text-sm font-semibold text-dark-text truncate">
          {currentTrack.title}
        </h3>
        <p className="text-xs text-dark-text-secondary truncate">
          {currentTrack.artist} • {currentTrack.album}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-dark-text-secondary">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(currentTrack.duration)}</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={currentTrack.duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer slider"
          />
          <div 
            className="absolute top-0 left-0 h-2 bg-pink-400 rounded-lg pointer-events-none"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => setShuffle(!shuffle)}
          className={`p-2 rounded-full transition-colors duration-200 ${
            shuffle ? 'text-pink-400 bg-pink-400/20' : 'text-dark-text-secondary hover:text-dark-text'
          }`}
        >
          <Shuffle className="w-4 h-4" />
        </button>
        
        <button className="p-2 rounded-full text-dark-text-secondary hover:text-dark-text transition-colors duration-200">
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button
          onClick={handlePlayPause}
          className="p-3 rounded-full bg-pink-400 hover:bg-pink-500 text-white transition-colors duration-200"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        
        <button className="p-2 rounded-full text-dark-text-secondary hover:text-dark-text transition-colors duration-200">
          <SkipForward className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setRepeat(!repeat)}
          className={`p-2 rounded-full transition-colors duration-200 ${
            repeat ? 'text-pink-400 bg-pink-400/20' : 'text-dark-text-secondary hover:text-dark-text'
          }`}
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* Volume & Like */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`p-2 rounded-full transition-colors duration-200 ${
            isLiked ? 'text-red-400' : 'text-dark-text-secondary hover:text-dark-text'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        
        <div className="flex items-center space-x-2 flex-1 ml-4">
          <Volume2 className="w-4 h-4 text-dark-text-secondary" />
          <div className="flex-1 relative">
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer slider"
            />
            <div 
              className="absolute top-0 left-0 h-2 bg-pink-400 rounded-lg pointer-events-none"
              style={{ width: `${volume}%` }}
            ></div>
          </div>
          <span className="text-xs text-dark-text-secondary w-8 text-right">{volume}</span>
        </div>
      </div>

      {/* Queue/Playlist indicator */}
      <div className="text-center">
        <span className="text-xs text-dark-text-secondary">
          Playing from <span className="text-pink-400">Chill Playlist</span> • 1 of 24
        </span>
      </div>
    </div>
  )
}

export default MusicPlayer