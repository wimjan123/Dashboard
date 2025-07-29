import React, { useState, useEffect } from 'react'
import { Play, Square, Monitor, Grid3X3, Plus, Edit3, X, Trash2, ExternalLink } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { 
  StreamSource, 
  DEFAULT_STREAMS, 
  DEFAULT_CATEGORIES,
  detectStreamType,
  convertToEmbedUrl,
  generateThumbnailUrl,
  validateStreamUrl
} from '../utils/streamUtils'

const Livestreams: React.FC = () => {
  const [selectedStreams, setSelectedStreams] = useState<StreamSource[]>([])
  const [splitView, setSplitView] = useState<'single' | '2x1' | '2x2'>('single')
  const [customStreams, setCustomStreams] = useLocalStorage<StreamSource[]>('dashboard-custom-streams', [])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isAddingStream, setIsAddingStream] = useState(false)
  const [editingStream, setEditingStream] = useState<StreamSource | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: 'other',
    description: ''
  })
  const [formError, setFormError] = useState('')

  // Combine default and custom streams
  const allStreams = [...DEFAULT_STREAMS, ...customStreams]
  
  // Filter streams by category
  const filteredStreams = selectedCategory === 'all' 
    ? allStreams 
    : allStreams.filter(stream => stream.category === selectedCategory)

  const playStream = (stream: StreamSource) => {
    if (splitView === 'single') {
      setSelectedStreams([stream])
    } else if (splitView === '2x1' && selectedStreams.length < 2) {
      setSelectedStreams([...selectedStreams, stream])
    } else if (splitView === '2x2' && selectedStreams.length < 4) {
      setSelectedStreams([...selectedStreams, stream])
    }
  }

  const removeStream = (streamId: string) => {
    setSelectedStreams(selectedStreams.filter(s => s.id !== streamId))
  }

  const clearAllStreams = () => {
    setSelectedStreams([])
  }

  const getGridClass = () => {
    switch (splitView) {
      case '2x1':
        return 'grid-cols-2 grid-rows-1'
      case '2x2':
        return 'grid-cols-2 grid-rows-2'
      default:
        return 'grid-cols-1 grid-rows-1'
    }
  }

  const getMaxStreams = () => {
    switch (splitView) {
      case '2x1': return 2
      case '2x2': return 4
      default: return 1
    }
  }

  const startAddStream = () => {
    setFormData({ name: '', url: '', category: 'other', description: '' })
    setFormError('')
    setIsAddingStream(true)
  }

  const startEditStream = (stream: StreamSource) => {
    setFormData({
      name: stream.name,
      url: stream.url,
      category: stream.category || 'other',
      description: stream.description || ''
    })
    setFormError('')
    setEditingStream(stream)
  }

  const cancelForm = () => {
    setIsAddingStream(false)
    setEditingStream(null)
    setFormData({ name: '', url: '', category: 'other', description: '' })
    setFormError('')
  }

  const saveStream = () => {
    const { name, url, category, description } = formData
    
    if (!name.trim()) {
      setFormError('Stream name is required')
      return
    }

    const validation = validateStreamUrl(url)
    if (!validation.isValid) {
      setFormError(validation.error || 'Invalid URL')
      return
    }

    const streamType = detectStreamType(url)
    const embedUrl = convertToEmbedUrl(url)
    
    const streamData: StreamSource = {
      id: editingStream?.id || Date.now().toString(),
      name: name.trim(),
      url,
      embedUrl,
      type: streamType,
      category,
      description: description.trim(),
      createdAt: editingStream?.createdAt || new Date().toISOString(),
      thumbnail: generateThumbnailUrl({
        id: '',
        name: '',
        url,
        embedUrl,
        type: streamType,
        createdAt: ''
      })
    }

    if (editingStream) {
      // Update existing stream
      setCustomStreams(prev => 
        prev.map(stream => stream.id === editingStream.id ? streamData : stream)
      )
    } else {
      // Add new stream
      setCustomStreams(prev => [...prev, streamData])
    }

    cancelForm()
  }

  const deleteStream = (streamId: string) => {
    setCustomStreams(prev => prev.filter(stream => stream.id !== streamId))
    // Remove from selected streams if it's currently playing
    setSelectedStreams(prev => prev.filter(stream => stream.id !== streamId))
  }

  const getCategoryById = (categoryId: string) => {
    return DEFAULT_CATEGORIES.find(cat => cat.id === categoryId) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1]
  }

  const getPlatformIcon = (type: StreamSource['type']) => {
    switch (type) {
      case 'youtube': return '📺'
      case 'twitch': return '🎮'
      case 'vimeo': return '🎬'
      default: return '📡'
    }
  }

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (isAddingStream || editingStream)) {
        cancelForm()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isAddingStream, editingStream])

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSplitView('single')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              splitView === 'single' 
                ? 'bg-red-500 text-white' 
                : 'bg-dark-card text-dark-text-secondary hover:text-dark-text'
            }`}
            title="Single view"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSplitView('2x1')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              splitView === '2x1' 
                ? 'bg-red-500 text-white' 
                : 'bg-dark-card text-dark-text-secondary hover:text-dark-text'
            }`}
            title="Split view (2x1)"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSplitView('2x2')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              splitView === '2x2' 
                ? 'bg-red-500 text-white' 
                : 'bg-dark-card text-dark-text-secondary hover:text-dark-text'
            }`}
            title="Grid view (2x2)"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-dark-text-secondary">
            {selectedStreams.length}/{getMaxStreams()} streams
          </span>
          {selectedStreams.length > 0 && (
            <button
              onClick={clearAllStreams}
              className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-dark-card text-dark-text-secondary hover:text-dark-text'
            }`}
          >
            All
          </button>
          {DEFAULT_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center space-x-1 ${
                selectedCategory === category.id
                  ? `${category.color} text-white shadow-lg`
                  : 'bg-dark-card text-dark-text-secondary hover:text-dark-text'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
        
        <button
          onClick={startAddStream}
          className="ml-2 p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors duration-200 group flex-shrink-0"
          title="Add custom stream"
        >
          <Plus className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>

      {/* Video Display Area */}
      {selectedStreams.length > 0 ? (
        <div className={`grid gap-2 flex-1 ${getGridClass()}`}>
          {selectedStreams.map((stream, index) => (
            <div key={stream.id + index} className="relative bg-dark-card rounded-lg overflow-hidden group">
              <iframe
                src={stream.embedUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={stream.name}
              />
              
              {/* Stream Controls Overlay */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center space-x-2">
                  <span className="text-white text-xs font-medium bg-black bg-opacity-75 px-2 py-1 rounded flex items-center space-x-1">
                    <span>{getPlatformIcon(stream.type)}</span>
                    <span>{stream.name}</span>
                  </span>
                  {stream.isLive && (
                    <span className="text-white text-xs bg-red-500 px-2 py-1 rounded font-medium">
                      LIVE
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeStream(stream.id)}
                  className="text-white bg-red-500 hover:bg-red-600 p-1 rounded transition-colors duration-200"
                  title="Remove stream"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: getMaxStreams() - selectedStreams.length }).map((_, index) => (
            <div key={`empty-${index}`} className="bg-dark-card rounded-lg border-2 border-dashed border-dark-border flex items-center justify-center">
              <div className="text-center text-dark-text-secondary">
                <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a stream</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 bg-dark-card rounded-lg border-2 border-dashed border-dark-border flex items-center justify-center">
          <div className="text-center text-dark-text-secondary">
            <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-2">No streams selected</p>
            <p className="text-sm">Choose a stream from the list below</p>
          </div>
        </div>
      )}

      {/* Stream Selection */}
      <div className="mt-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-dark-text">
            Available Streams ({filteredStreams.length})
          </h4>
          {selectedCategory !== 'all' && (
            <span className="text-xs text-dark-text-secondary">
              Filtered by {getCategoryById(selectedCategory).name}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto scrollbar-thin">
          {filteredStreams.map((stream) => (
            <div
              key={stream.id}
              className="flex items-center justify-between p-2 bg-dark-card hover:bg-opacity-80 rounded-lg transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <button
                  onClick={() => playStream(stream)}
                  disabled={selectedStreams.length >= getMaxStreams() || selectedStreams.some(s => s.id === stream.id)}
                  className="flex items-center space-x-2 flex-1 min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`w-8 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                    stream.type === 'youtube' ? 'bg-red-500' :
                    stream.type === 'twitch' ? 'bg-purple-500' :
                    stream.type === 'vimeo' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    <Play className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-dark-text group-hover:text-red-400 transition-colors duration-200 truncate font-medium">
                        {stream.name}
                      </span>
                      {stream.isLive && (
                        <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded font-medium">
                          LIVE
                        </span>
                      )}
                    </div>
                    {stream.description && (
                      <p className="text-xs text-dark-text-secondary truncate">
                        {stream.description}
                      </p>
                    )}
                  </div>
                </button>
              </div>
              
              {/* Stream Actions */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => window.open(stream.url, '_blank')}
                  className="p-1 text-dark-text-secondary hover:text-blue-400 transition-colors duration-200"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                
                {/* Only show edit/delete for custom streams */}
                {!DEFAULT_STREAMS.some(defaultStream => defaultStream.id === stream.id) && (
                  <>
                    <button
                      onClick={() => startEditStream(stream)}
                      className="p-1 text-dark-text-secondary hover:text-yellow-400 transition-colors duration-200"
                      title="Edit stream"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteStream(stream.id)}
                      className="p-1 text-dark-text-secondary hover:text-red-400 transition-colors duration-200"
                      title="Delete stream"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {filteredStreams.length === 0 && (
            <div className="text-center py-4 text-dark-text-secondary">
              <p className="text-sm">No streams in this category</p>
              <button
                onClick={startAddStream}
                className="text-green-400 hover:text-green-300 text-sm mt-1 transition-colors duration-200"
              >
                Add a custom stream
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Stream Modal */}
      {(isAddingStream || editingStream) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelForm}>
          <div className="glass-effect rounded-xl p-6 border border-red-400/30 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-dark-text mb-4">
              {isAddingStream ? 'Add Custom Stream' : 'Edit Stream'}
            </h3>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-1">Stream Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Awesome Stream"
                  className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-red-400 transition-colors duration-200"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-text mb-1">Stream URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or https://twitch.tv/..."
                  className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-red-400 transition-colors duration-200"
                />
                <p className="text-xs text-dark-text-secondary mt-1">
                  Supports YouTube, Twitch, Vimeo, and custom streaming URLs
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-text mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-red-400 transition-colors duration-200"
                >
                  {DEFAULT_CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-text mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the stream"
                  className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-red-400 transition-colors duration-200"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={cancelForm}
                  className="px-4 py-2 text-dark-text-secondary hover:text-dark-text transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveStream}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                >
                  {isAddingStream ? 'Add Stream' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Livestreams