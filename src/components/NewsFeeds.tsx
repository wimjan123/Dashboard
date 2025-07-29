import React, { useState, useEffect } from 'react'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { fetchFeedsByCategory, NewsItem } from '../utils/rssParser'

const NewsFeeds: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeed, setSelectedFeed] = useState('general')

  const feeds = [
    { id: 'general', name: 'General', color: 'bg-blue-500' },
    { id: 'tech', name: 'Technology', color: 'bg-green-500' },
    { id: 'business', name: 'Business', color: 'bg-purple-500' },
    { id: 'x', name: 'X (Twitter)', color: 'bg-black' },
  ]

  // Mock data as fallback
  const getMockNews = (category: string): NewsItem[] => {
    if (category === 'x') {
      return [
        {
          id: 'x1',
          title: 'Major tech breakthrough announced at AI summit',
          description: 'Revolutionary AI model shows unprecedented capabilities in reasoning and problem-solving',
          url: '#',
          publishedAt: '2h',
          source: '@TechCrunch'
        },
        {
          id: 'x2',
          title: 'Breaking: New climate policy announced',
          description: 'Global leaders commit to ambitious carbon reduction targets',
          url: '#',
          publishedAt: '4h',
          source: '@BBCBreaking'
        },
        {
          id: 'x3',
          title: 'Market update: Tech stocks surge',
          description: 'NASDAQ reaches new highs amid positive earnings reports',
          url: '#',
          publishedAt: '6h',
          source: '@MarketWatch'
        }
      ]
    }
    
    return [
      {
        id: '1',
        title: 'Loading Real News Feeds...',
        description: 'Connecting to live RSS feeds from BBC, Reuters, TechCrunch, and other sources',
        url: '#',
        publishedAt: 'Just now',
        source: 'Dashboard'
      }
    ]
  }

  const loadNews = async () => {
    setLoading(true)
    
    // Start with mock data
    const mockData = getMockNews(selectedFeed)
    setNews(mockData)
    setLoading(false)
    
    // For X feed, just use mock data for now
    if (selectedFeed === 'x') {
      return
    }
    
    // Then try to load real data in background for other feeds
    try {
      const newsItems = await fetchFeedsByCategory(selectedFeed)
      if (newsItems && newsItems.length > 0) {
        setNews(newsItems)
      }
    } catch (error) {
      console.error('Failed to load real news, using fallback:', error)
      // Keep mock data if real data fails
      setNews([{
        id: 'fallback',
        title: 'RSS Feeds Temporarily Unavailable',
        description: 'Unable to connect to live news feeds. Using demo data for demonstration.',
        url: '#',
        publishedAt: 'Just now',
        source: 'System'
      }])
    }
  }

  useEffect(() => {
    loadNews()
  }, [selectedFeed])

  const refreshFeed = () => {
    loadNews()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Feed Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          {feeds.map((feed) => (
            <button
              key={feed.id}
              onClick={() => setSelectedFeed(feed.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedFeed === feed.id
                  ? `${feed.color} text-white shadow-lg`
                  : 'bg-dark-card text-dark-text-secondary hover:text-dark-text'
              }`}
            >
              {feed.name}
            </button>
          ))}
        </div>
        
        <button
          onClick={refreshFeed}
          disabled={loading}
          className="p-2 rounded-lg bg-dark-card hover:bg-opacity-80 transition-all duration-200 group"
        >
          <RefreshCw className={`w-4 h-4 text-dark-text-secondary group-hover:text-dark-text ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-dark-card rounded mb-2"></div>
                <div className="h-3 bg-dark-card rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-dark-card rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          news.map((item, index) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-dark-card hover:bg-opacity-80 transition-all duration-300 cursor-pointer group animate-fade-in border border-dark-border hover:border-blue-500/30"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => item.url !== '#' && window.open(item.url, '_blank')}
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-dark-text group-hover:text-blue-400 transition-colors duration-200 leading-tight text-sm line-clamp-2">
                  {item.title}
                </h3>
                <ExternalLink className="w-3 h-3 text-dark-text-secondary group-hover:text-blue-400 transition-colors duration-200 ml-2 flex-shrink-0 mt-0.5" />
              </div>
              
              <p className="text-dark-text-secondary text-xs mb-2 leading-tight line-clamp-2">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-400 font-medium truncate">{item.source}</span>
                <span className="text-dark-text-secondary text-xs">{item.publishedAt}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NewsFeeds