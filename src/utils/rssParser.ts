import axios from 'axios'

export interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
}

export interface RSSFeed {
  id: string
  name: string
  url: string
  category: string
}

export const RSS_FEEDS: RSSFeed[] = [
  // General News
  { id: 'bbc', name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'general' },
  { id: 'reuters', name: 'Reuters', url: 'https://feeds.reuters.com/reuters/topNews', category: 'general' },
  { id: 'ap', name: 'Associated Press', url: 'https://apnews.com/apf-topnews', category: 'general' },
  { id: 'cnn', name: 'CNN', url: 'https://rss.cnn.com/rss/edition.rss', category: 'general' },
  { id: 'npr', name: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml', category: 'general' },
  { id: 'guardian', name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', category: 'general' },
  { id: 'aljazeera', name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'general' },
  { id: 'usatoday', name: 'USA Today', url: 'https://rssfeeds.usatoday.com/usatoday-NewsTopStories', category: 'general' },
  
  // Technology
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech' },
  { id: 'ars', name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech' },
  { id: 'verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech' },
  { id: 'wired', name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'tech' },
  { id: 'engadget', name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'tech' },
  { id: 'mittr', name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', category: 'tech' },
  { id: 'zdnet', name: 'ZDNet', url: 'https://www.zdnet.com/news/rss.xml', category: 'tech' },
  
  // Business
  { id: 'wsj', name: 'Wall Street Journal', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', category: 'business' },
  { id: 'bloomberg', name: 'Bloomberg', url: 'https://feeds.bloomberg.com/markets/news.rss', category: 'business' },
  { id: 'ft', name: 'Financial Times', url: 'https://www.ft.com/world?format=rss', category: 'business' },
  { id: 'cnbc', name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', category: 'business' },
  { id: 'marketwatch', name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', category: 'business' },
  { id: 'forbes', name: 'Forbes', url: 'https://www.forbes.com/real-time/feed2/', category: 'business' },
  { id: 'businessinsider', name: 'Business Insider', url: 'https://feeds.businessinsider.com/custom/all', category: 'business' },
  
  // Science
  { id: 'nature', name: 'Nature', url: 'https://www.nature.com/subjects/biological-sciences.rss', category: 'science' },
  { id: 'sciam', name: 'Scientific American', url: 'https://rss.sciam.com/ScientificAmerican-Global', category: 'science' },
  { id: 'newscientist', name: 'New Scientist', url: 'https://www.newscientist.com/feed/home/', category: 'science' },
  { id: 'sciencedaily', name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'science' },
  { id: 'space', name: 'Space.com', url: 'https://www.space.com/feeds/news', category: 'science' },
  
  // Sports
  { id: 'espn', name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', category: 'sports' },
  { id: 'si', name: 'Sports Illustrated', url: 'https://www.si.com/rss.xml', category: 'sports' },
  { id: 'athletic', name: 'The Athletic', url: 'https://theathletic.com/rss/', category: 'sports' },
  { id: 'bbcsport', name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports' },
  
  // Entertainment
  { id: 'ew', name: 'Entertainment Weekly', url: 'https://ew.com/feed/', category: 'entertainment' },
  { id: 'variety', name: 'Variety', url: 'https://variety.com/feed/', category: 'entertainment' },
  { id: 'thr', name: 'Hollywood Reporter', url: 'https://www.hollywoodreporter.com/feed/', category: 'entertainment' },
  { id: 'rollingstone', name: 'Rolling Stone', url: 'https://www.rollingstone.com/feed/', category: 'entertainment' },
]

// Multiple CORS proxy services with fallbacks
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/'
]

let currentProxyIndex = 0

const parseXML = (xmlString: string): Document => {
  const parser = new DOMParser()
  return parser.parseFromString(xmlString, 'text/xml')
}

const extractTextContent = (element: Element | null): string => {
  if (!element) return ''
  
  // Try to get clean text content, removing HTML tags
  const content = element.textContent || element.innerHTML || ''
  return content.replace(/<[^>]*>/g, '').trim()
}

const getPublishedDate = (item: Element): string => {
  const pubDate = item.querySelector('pubDate')?.textContent ||
                  item.querySelector('published')?.textContent ||
                  item.querySelector('dc\\:date')?.textContent ||
                  item.querySelector('date')?.textContent

  if (pubDate) {
    try {
      const date = new Date(pubDate)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      if (diffHours < 1) return 'Just now'
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    } catch {
      return 'Recently'
    }
  }
  
  return 'Recently'
}

const fetchWithProxy = async (url: string, proxyUrl: string): Promise<any> => {
  const response = await axios.get(`${proxyUrl}${encodeURIComponent(url)}`, {
    timeout: 10000,
    headers: {
      'Accept': 'application/rss+xml, application/xml, text/xml',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })

  let xmlContent = response.data
  
  // Handle different proxy response formats
  if (typeof xmlContent === 'object') {
    if (xmlContent.contents) {
      xmlContent = xmlContent.contents // allorigins format
    } else if (xmlContent.data) {
      xmlContent = xmlContent.data // codetabs format
    }
  }

  return xmlContent
}

export const fetchRSSFeed = async (feed: RSSFeed): Promise<NewsItem[]> => {
  let lastError: Error | null = null
  
  // Try each proxy in sequence
  for (let attempt = 0; attempt < CORS_PROXIES.length; attempt++) {
    const proxyIndex = (currentProxyIndex + attempt) % CORS_PROXIES.length
    const proxy = CORS_PROXIES[proxyIndex]
    
    try {
      const xmlContent = await fetchWithProxy(feed.url, proxy)
      const doc = parseXML(xmlContent)
      
      // Check if parsing was successful
      if (doc.querySelector('parsererror')) {
        throw new Error('XML parsing failed')
      }
      
      const items = doc.querySelectorAll('item, entry')
      
      if (items.length === 0) {
        throw new Error('No items found in feed')
      }

      const newsItems: NewsItem[] = []

      for (let i = 0; i < Math.min(items.length, 10); i++) {
        const item = items[i]
        
        const title = extractTextContent(
          item.querySelector('title')
        )
        
        const description = extractTextContent(
          item.querySelector('description') ||
          item.querySelector('summary') ||
          item.querySelector('content')
        )
        
        const link = item.querySelector('link')?.textContent ||
                     item.querySelector('link')?.getAttribute('href') ||
                     item.querySelector('guid')?.textContent ||
                     '#'

        if (title && title.length > 0) {
          newsItems.push({
            id: `${feed.id}-${i}-${Date.now()}`,
            title: title.slice(0, 150),
            description: description.slice(0, 200) + (description.length > 200 ? '...' : ''),
            url: link,
            publishedAt: getPublishedDate(item),
            source: feed.name
          })
        }
      }

      // Success! Update the current proxy index for next time
      currentProxyIndex = proxyIndex
      
      // Mark feed as healthy
      feedHealthCache.set(feed.id, { isHealthy: true, lastChecked: Date.now() })
      
      return newsItems
      
    } catch (error) {
      lastError = error as Error
      console.warn(`Proxy ${proxy} failed for ${feed.name}:`, error)
      continue
    }
  }
  
  // All proxies failed
  console.error(`All proxies failed for RSS feed ${feed.name}:`, lastError)
  
  // Mark feed as unhealthy
  feedHealthCache.set(feed.id, { isHealthy: false, lastChecked: Date.now() })
  
  // Return fallback data with more specific error info
  return [{
    id: `${feed.id}-fallback-${Date.now()}`,
    title: `Unable to load ${feed.name}`,
    description: `RSS feed temporarily unavailable (${lastError?.message || 'Network error'}). Trying backup sources...`,
    url: '#',
    publishedAt: 'Just now',
    source: feed.name
  }]
}

// Feed health cache
const feedHealthCache = new Map<string, { isHealthy: boolean; lastChecked: number }>()
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

export const validateFeedHealth = async (feed: RSSFeed): Promise<boolean> => {
  const cached = feedHealthCache.get(feed.id)
  const now = Date.now()
  
  // Return cached result if recent
  if (cached && (now - cached.lastChecked) < HEALTH_CHECK_INTERVAL) {
    return cached.isHealthy
  }
  
  // Try a quick health check with the current working proxy
  const proxy = CORS_PROXIES[currentProxyIndex]
  
  try {
    const response = await axios.head(`${proxy}${encodeURIComponent(feed.url)}`, {
      timeout: 5000
    })
    const isHealthy = response.status === 200
    feedHealthCache.set(feed.id, { isHealthy, lastChecked: now })
    return isHealthy
  } catch (error) {
    // If health check fails, try a lightweight GET request
    try {
      const response = await axios.get(`${proxy}${encodeURIComponent(feed.url)}`, {
        timeout: 5000,
        headers: { 'Range': 'bytes=0-1024' } // Only fetch first 1KB
      })
      const isHealthy = response.status === 200
      feedHealthCache.set(feed.id, { isHealthy, lastChecked: now })
      return isHealthy
    } catch (error2) {
      feedHealthCache.set(feed.id, { isHealthy: false, lastChecked: now })
      return false
    }
  }
}

export const getFeedStats = (category?: string): { total: number; healthy: number; sources: string[] } => {
  const feeds = category ? RSS_FEEDS.filter(f => f.category === category) : RSS_FEEDS
  const healthy = feeds.filter(feed => {
    const cached = feedHealthCache.get(feed.id)
    return cached?.isHealthy ?? true // Default to healthy if not checked
  }).length
  
  return {
    total: feeds.length,
    healthy,
    sources: feeds.map(f => f.name)
  }
}

export const fetchFeedsByCategory = async (category: string): Promise<NewsItem[]> => {
  const categoryFeeds = RSS_FEEDS.filter(feed => feed.category === category)
  
  if (categoryFeeds.length === 0) {
    return [{
      id: 'no-feeds',
      title: 'No feeds configured for this category',
      description: `The ${category} category doesn't have any RSS feeds configured yet.`,
      url: '#',
      publishedAt: 'Just now',
      source: 'System'
    }]
  }
  
  try {
    // Fetch from multiple feeds concurrently with timeout
    const feedPromises = categoryFeeds.map(feed => 
      Promise.race([
        fetchRSSFeed(feed),
        new Promise<NewsItem[]>((_, reject) => 
          setTimeout(() => reject(new Error('Feed timeout')), 15000)
        )
      ])
    )
    
    const feedResults = await Promise.allSettled(feedPromises)
    
    // Combine all successful results
    const allItems: NewsItem[] = []
    let successfulFeeds = 0
    
    feedResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value)
        successfulFeeds++
      } else {
        console.warn(`Feed ${categoryFeeds[index].name} failed:`, result.reason)
      }
    })
    
    // If no feeds succeeded, return error message
    if (successfulFeeds === 0) {
      return [{
        id: 'all-feeds-failed',
        title: 'All news sources temporarily unavailable',
        description: `Unable to load any ${category} news feeds. This may be due to network issues or source maintenance. Please try again later.`,
        url: '#',
        publishedAt: 'Just now',
        source: 'System'
      }]
    }
    
    // Add feed status info if some failed
    if (successfulFeeds < categoryFeeds.length) {
      const failedCount = categoryFeeds.length - successfulFeeds
      allItems.unshift({
        id: 'partial-failure',
        title: `⚠️ ${failedCount} of ${categoryFeeds.length} news sources unavailable`,
        description: `Some news feeds are temporarily offline. Showing available content from ${successfulFeeds} sources.`,
        url: '#',
        publishedAt: 'Just now',
        source: 'System'
      })
    }
    
    // Sort by recency, then by source
    return allItems
      .sort((a, b) => {
        // System messages first
        if (a.source === 'System' && b.source !== 'System') return -1
        if (b.source === 'System' && a.source !== 'System') return 1
        
        // Then by recency (newest first)
        if (a.publishedAt !== b.publishedAt) {
          return b.publishedAt.localeCompare(a.publishedAt)
        }
        
        // Finally by source name
        return a.source.localeCompare(b.source)
      })
      .slice(0, 20) // Increased limit to accommodate more sources
      
  } catch (error) {
    console.error('Failed to fetch news feeds:', error)
    
    // Return detailed error message
    return [{
      id: 'error-fallback',
      title: 'Unable to load news feeds',
      description: 'There was an issue loading the latest news. Please check your internet connection and try again.',
      url: '#',
      publishedAt: 'Just now',
      source: 'System'
    }]
  }
}