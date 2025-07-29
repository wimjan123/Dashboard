import React, { useState, useEffect } from 'react'
import { X, Search, Plus, Trash2, ExternalLink, Rss } from 'lucide-react'
import { RSS_FEEDS, RSSFeed } from '../utils/rssParser'

interface ManageSourcesModalProps {
  isOpen: boolean
  onClose: () => void
  onSourcesUpdate: () => void
}

interface CustomFeed extends RSSFeed {
  isCustom: boolean
}

const ManageSourcesModal: React.FC<ManageSourcesModalProps> = ({
  isOpen,
  onClose,
  onSourcesUpdate
}) => {
  const [enabledSources, setEnabledSources] = useState<Set<string>>(new Set())
  const [customFeeds, setCustomFeeds] = useState<CustomFeed[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newFeed, setNewFeed] = useState({
    name: '',
    url: '',
    category: 'general'
  })

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'general', name: 'General' },
    { id: 'tech', name: 'Technology' },
    { id: 'business', name: 'Business' },
    { id: 'science', name: 'Science' },
    { id: 'sports', name: 'Sports' },
    { id: 'entertainment', name: 'Entertainment' }
  ]

  useEffect(() => {
    if (isOpen) {
      // Load enabled sources from localStorage
      const saved = localStorage.getItem('dashboard-enabled-sources')
      if (saved) {
        setEnabledSources(new Set(JSON.parse(saved)))
      } else {
        // Default: enable first 10 sources to reduce clutter
        const defaultEnabled = RSS_FEEDS.slice(0, 10).map(feed => feed.id)
        setEnabledSources(new Set(defaultEnabled))
      }

      // Load custom feeds
      const savedCustom = localStorage.getItem('dashboard-custom-feeds')
      if (savedCustom) {
        setCustomFeeds(JSON.parse(savedCustom))
      }
    }
  }, [isOpen])

  const saveSettings = () => {
    localStorage.setItem('dashboard-enabled-sources', JSON.stringify([...enabledSources]))
    localStorage.setItem('dashboard-custom-feeds', JSON.stringify(customFeeds))
    onSourcesUpdate()
  }

  const toggleSource = (feedId: string) => {
    const newEnabled = new Set(enabledSources)
    if (newEnabled.has(feedId)) {
      newEnabled.delete(feedId)
    } else {
      newEnabled.add(feedId)
    }
    setEnabledSources(newEnabled)
  }

  const addCustomFeed = () => {
    if (newFeed.name.trim() && newFeed.url.trim()) {
      const customFeed: CustomFeed = {
        id: `custom-${Date.now()}`,
        name: newFeed.name.trim(),
        url: newFeed.url.trim(),
        category: newFeed.category,
        isCustom: true
      }
      
      const updatedCustomFeeds = [...customFeeds, customFeed]
      setCustomFeeds(updatedCustomFeeds)
      
      // Auto-enable new custom feed
      const newEnabled = new Set(enabledSources)
      newEnabled.add(customFeed.id)
      setEnabledSources(newEnabled)
      
      // Reset form
      setNewFeed({ name: '', url: '', category: 'general' })
      setShowAddForm(false)
    }
  }

  const removeCustomFeed = (feedId: string) => {
    setCustomFeeds(customFeeds.filter(feed => feed.id !== feedId))
    const newEnabled = new Set(enabledSources)
    newEnabled.delete(feedId)
    setEnabledSources(newEnabled)
  }

  const getAllFeeds = (): CustomFeed[] => {
    const defaultFeeds: CustomFeed[] = RSS_FEEDS.map(feed => ({ ...feed, isCustom: false }))
    return [...defaultFeeds, ...customFeeds]
  }

  const filteredFeeds = getAllFeeds().filter(feed => {
    const matchesSearch = feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || feed.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const enabledCount = enabledSources.size
  const totalCount = getAllFeeds().length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden border border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Rss className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-dark-text">Manage News Sources</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-border transition-colors duration-200"
          >
            <X className="w-5 h-5 text-dark-text-secondary" />
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 p-4 bg-dark-bg rounded-lg border border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-dark-text-secondary">
              {enabledCount} of {totalCount} sources enabled
            </span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setEnabledSources(new Set(getAllFeeds().map(f => f.id)))}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Enable All
              </button>
              <button
                onClick={() => setEnabledSources(new Set())}
                className="text-sm text-red-400 hover:text-red-300 transition-colors duration-200"
              >
                Disable All
              </button>
            </div>
          </div>
          <div className="mt-2 w-full bg-dark-border rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (enabledCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-text-secondary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search news sources..."
              className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-blue-400 transition-colors duration-200"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-blue-400 transition-colors duration-200"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Source</span>
          </button>
        </div>

        {/* Add Custom Feed Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-dark-bg rounded-lg border border-dark-border">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Add Custom RSS Feed</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={newFeed.name}
                onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                placeholder="Feed name"
                className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-green-400 transition-colors duration-200"
              />
              <input
                type="url"
                value={newFeed.url}
                onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
                placeholder="RSS URL"
                className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-green-400 transition-colors duration-200"
              />
              <select
                value={newFeed.category}
                onChange={(e) => setNewFeed({ ...newFeed, category: e.target.value })}
                className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-green-400 transition-colors duration-200"
              >
                {categories.slice(1).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-dark-text-secondary hover:text-dark-text transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={addCustomFeed}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors duration-200"
              >
                Add Feed
              </button>
            </div>
          </div>
        )}

        {/* Sources List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin max-h-96">
          <div className="space-y-2">
            {filteredFeeds.map((feed) => (
              <div
                key={feed.id}
                className="flex items-center justify-between p-3 bg-dark-bg rounded-lg border border-dark-border hover:border-blue-400/30 transition-all duration-200"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={enabledSources.has(feed.id)}
                    onChange={() => toggleSource(feed.id)}
                    className="w-4 h-4 text-blue-500 bg-dark-card border-dark-border rounded focus:ring-blue-400 focus:ring-2"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-dark-text truncate">{feed.name}</span>
                      {feed.isCustom && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-dark-text-secondary capitalize">
                      {feed.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(feed.url, '_blank')}
                    className="p-1 text-dark-text-secondary hover:text-blue-400 transition-colors duration-200"
                    title="Open feed URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  
                  {feed.isCustom && (
                    <button
                      onClick={() => removeCustomFeed(feed.id)}
                      className="p-1 text-dark-text-secondary hover:text-red-400 transition-colors duration-200"
                      title="Remove custom feed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-dark-text-secondary hover:text-dark-text transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              saveSettings()
              onClose()
            }}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors duration-200"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default ManageSourcesModal