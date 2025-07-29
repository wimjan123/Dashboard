import React, { useState, useEffect } from 'react'
import { ExternalLink, RefreshCw, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { fetchFeedsByCategory, NewsItem, getFeedStats, RSS_FEEDS, validateFeedHealth } from '../utils/rssParser'

const NewsFeeds: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeed, setSelectedFeed] = useState('general')
  const [feedStats, setFeedStats] = useState<ReturnType<typeof getFeedStats> | null>(null)
  const [showHealthMonitor, setShowHealthMonitor] = useState(false)
  const [feedHealthStatus, setFeedHealthStatus] = useState<Record<string, boolean>>({})
  const [healthCheckLoading, setHealthCheckLoading] = useState(false)

  const feeds = [
    { id: 'general', name: 'General', color: 'bg-blue-500' },
    { id: 'tech', name: 'Technology', color: 'bg-green-500' },
    { id: 'business', name: 'Business', color: 'bg-purple-500' },
    { id: 'science', name: 'Science', color: 'bg-cyan-500' },
    { id: 'sports', name: 'Sports', color: 'bg-orange-500' },
    { id: 'entertainment', name: 'Entertainment', color: 'bg-pink-500' },
    { id: 'x', name: 'X (Twitter)', color: 'bg-black' },
  ]

  // Mock data as fallback
  const getMockNews = (category: string): NewsItem[] => {
    const mockData: Record<string, NewsItem[]> = {
      x: [
        {
          id: 'x1',
          title: '🚀 Just announced: Revolutionary AI breakthrough in quantum computing',
          description: 'Major tech companies collaborate on quantum-AI hybrid system. #AI #QuantumComputing #TechNews',
          url: '#',
          publishedAt: '2h',
          source: '@elonmusk'
        },
        {
          id: 'x2',
          title: '🌍 BREAKING: Global climate summit reaches historic agreement',
          description: '195 countries commit to ambitious carbon reduction targets by 2030. Thread below 🧵',
          url: '#',
          publishedAt: '4h',
          source: '@BBCBreaking'
        },
        {
          id: 'x3',
          title: '📈 Markets update: Tech stocks surge amid positive earnings',
          description: 'NASDAQ +3.2%, Apple hits new high. $AAPL $TSLA $GOOGL leading the rally #StockMarket',
          url: '#',
          publishedAt: '6h',
          source: '@MarketWatch'
        },
        {
          id: 'x4',
          title: '🎮 Gaming industry sees record-breaking year',
          description: 'Mobile gaming revenue up 40%, console sales at all-time high #Gaming #Entertainment',
          url: '#',
          publishedAt: '8h',
          source: '@TheVerge'
        }
      ],
      science: [
        {
          id: 's1',
          title: 'New exoplanet discovered in habitable zone',
          description: 'Scientists find Earth-like planet 12 light-years away with potential for liquid water',
          url: '#',
          publishedAt: '3h',
          source: 'Nature'
        },
        {
          id: 's2',
          title: 'Breakthrough in cancer immunotherapy treatment',
          description: 'Clinical trials show 90% success rate in new targeted therapy approach',
          url: '#',
          publishedAt: '5h',
          source: 'Scientific American'
        }
      ],
      sports: [
        {
          id: 'sp1',
          title: 'Championship finals set as playoffs conclude',
          description: 'Two powerhouse teams advance to championship game after thrilling semifinals',
          url: '#',
          publishedAt: '1h',
          source: 'ESPN'
        },
        {
          id: 'sp2',
          title: 'Olympic records broken at international meet',
          description: 'Three world records shattered in swimming and track events',
          url: '#',
          publishedAt: '4h',
          source: 'Sports Illustrated'
        }
      ],
      entertainment: [
        {
          id: 'e1',
          title: 'Major film studio announces streaming platform',
          description: 'New service to feature exclusive content and day-one movie releases',
          url: '#',
          publishedAt: '2h',
          source: 'Variety'
        },
        {
          id: 'e2',
          title: 'Music festival lineup revealed for summer',
          description: 'Headliners include top artists across multiple genres and decades',
          url: '#',
          publishedAt: '6h',
          source: 'Rolling Stone'
        }
      ]
    }
    
    return mockData[category] || [
      {
        id: '1',
        title: 'Loading Real News Feeds...',
        description: 'Connecting to live RSS feeds across multiple sources',
        url: '#',
        publishedAt: 'Just now',
        source: 'Dashboard'
      }
    ]
  }

  const loadNews = async () => {
    setLoading(true)
    
    // Update feed stats
    setFeedStats(getFeedStats(selectedFeed))
    
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
        // Update stats after loading
        setFeedStats(getFeedStats(selectedFeed))
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

  const checkFeedHealth = async () => {
    setHealthCheckLoading(true)
    const categoryFeeds = RSS_FEEDS.filter(feed => selectedFeed === 'all' || feed.category === selectedFeed)
    const healthResults: Record<string, boolean> = {}
    
    // Check health of feeds in parallel
    const healthPromises = categoryFeeds.map(async (feed) => {
      try {
        const isHealthy = await validateFeedHealth(feed)
        healthResults[feed.id] = isHealthy
      } catch (error) {
        healthResults[feed.id] = false
      }
    })
    
    await Promise.allSettled(healthPromises)
    setFeedHealthStatus(healthResults)
    setHealthCheckLoading(false)
  }

  const getHealthStatusIcon = (feedId: string) => {
    if (healthCheckLoading) {
      return <Clock className="w-3 h-3 text-yellow-400 animate-spin" />
    }
    
    const isHealthy = feedHealthStatus[feedId]
    if (isHealthy === undefined) {
      return <Clock className="w-3 h-3 text-gray-400" />
    }
    
    return isHealthy 
      ? <CheckCircle className="w-3 h-3 text-green-400" />
      : <AlertTriangle className="w-3 h-3 text-red-400" />
  }

  const getHealthSummary = () => {
    const categoryFeeds = RSS_FEEDS.filter(feed => selectedFeed === 'all' || feed.category === selectedFeed)
    const checkedFeeds = categoryFeeds.filter(feed => feedHealthStatus[feed.id] !== undefined)
    const healthyFeeds = categoryFeeds.filter(feed => feedHealthStatus[feed.id] === true)
    
    if (checkedFeeds.length === 0) return null
    
    return {
      total: categoryFeeds.length,
      checked: checkedFeeds.length,
      healthy: healthyFeeds.length,
      unhealthy: checkedFeeds.length - healthyFeeds.length
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Feed Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2 overflow-x-auto scrollbar-thin">
          {feeds.map((feed) => (
            <button
              key={feed.id}
              onClick={() => setSelectedFeed(feed.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center space-x-1 ${
                selectedFeed === feed.id
                  ? `${feed.color} text-white shadow-lg`
                  : 'bg-dark-card text-dark-text-secondary hover:text-dark-text'
              }`}
            >
              <span>{feed.name}</span>
              {feedStats && selectedFeed === feed.id && selectedFeed !== 'x' && (
                <span className="text-xs opacity-75">
                  ({feedStats.total})
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          {feedStats && selectedFeed !== 'x' && (
            <div className="flex items-center space-x-1 text-xs text-dark-text-secondary">
              <Info className="w-3 h-3" />
              <span>{feedStats.total} sources</span>
            </div>
          )}
          
          {/* Health Monitor Button */}
          {selectedFeed !== 'x' && (
            <button
              onClick={() => setShowHealthMonitor(!showHealthMonitor)}
              className={`p-2 rounded-lg transition-all duration-200 group ${
                showHealthMonitor ? 'bg-green-500 text-white' : 'bg-dark-card hover:bg-opacity-80'
              }`}
              title="Feed health monitor"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={refreshFeed}
            disabled={loading}
            className="p-2 rounded-lg bg-dark-card hover:bg-opacity-80 transition-all duration-200 group"
          >
            <RefreshCw className={`w-4 h-4 text-dark-text-secondary group-hover:text-dark-text ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Health Monitor Panel */}
      {showHealthMonitor && selectedFeed !== 'x' && (
        <div className="mb-4 p-3 bg-dark-card rounded-lg border border-dark-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-dark-text flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Feed Health Monitor</span>
            </h4>
            
            <div className="flex items-center space-x-2">
              {(() => {
                const summary = getHealthSummary()
                return summary && (
                  <div className="text-xs text-dark-text-secondary">
                    <span className="text-green-400">{summary.healthy}</span>/
                    <span className="text-red-400">{summary.unhealthy}</span>/
                    <span>{summary.total}</span>
                  </div>
                )
              })()}
              
              <button
                onClick={checkFeedHealth}
                disabled={healthCheckLoading}
                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-700 text-white rounded text-xs transition-colors duration-200"
              >
                {healthCheckLoading ? 'Checking...' : 'Check All'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto scrollbar-thin">
            {RSS_FEEDS
              .filter(feed => selectedFeed === 'all' || feed.category === selectedFeed)
              .map((feed) => (
                <div
                  key={feed.id}
                  className="flex items-center justify-between p-2 bg-dark-bg rounded text-sm"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getHealthStatusIcon(feed.id)}
                    <span className="text-dark-text truncate">{feed.name}</span>
                    <span className="text-xs text-dark-text-secondary">({feed.category})</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(feed.url, '_blank')}
                      className="text-dark-text-secondary hover:text-blue-400 transition-colors duration-200"
                      title="Open feed URL"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => validateFeedHealth(feed).then(isHealthy => 
                        setFeedHealthStatus(prev => ({ ...prev, [feed.id]: isHealthy }))
                      )}
                      className="text-dark-text-secondary hover:text-green-400 transition-colors duration-200"
                      title="Test this feed"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

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