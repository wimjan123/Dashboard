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
  
  // Technology
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech' },
  { id: 'ars', name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech' },
  { id: 'verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech' },
  
  // Business
  { id: 'wsj', name: 'Wall Street Journal', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', category: 'business' },
  { id: 'bloomberg', name: 'Bloomberg', url: 'https://feeds.bloomberg.com/markets/news.rss', category: 'business' },
  { id: 'ft', name: 'Financial Times', url: 'https://www.ft.com/world?format=rss', category: 'business' },
]

// CORS proxy for RSS feeds
const CORS_PROXY = 'https://api.allorigins.win/get?url='

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

export const fetchRSSFeed = async (feed: RSSFeed): Promise<NewsItem[]> => {
  try {
    const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(feed.url)}`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    })

    let xmlContent = response.data
    
    // If using allorigins, extract the contents
    if (typeof xmlContent === 'object' && xmlContent.contents) {
      xmlContent = xmlContent.contents
    }

    const doc = parseXML(xmlContent)
    const items = doc.querySelectorAll('item, entry')

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

    return newsItems
  } catch (error) {
    console.error(`Failed to fetch RSS feed ${feed.name}:`, error)
    
    // Return fallback data if RSS fails
    return [{
      id: `${feed.id}-fallback-${Date.now()}`,
      title: `Unable to load ${feed.name}`,
      description: 'RSS feed temporarily unavailable. Please try refreshing or check your internet connection.',
      url: '#',
      publishedAt: 'Just now',
      source: feed.name
    }]
  }
}

export const fetchFeedsByCategory = async (category: string): Promise<NewsItem[]> => {
  const categoryFeeds = RSS_FEEDS.filter(feed => feed.category === category)
  
  try {
    // Fetch from multiple feeds concurrently
    const feedPromises = categoryFeeds.map(feed => fetchRSSFeed(feed))
    const feedResults = await Promise.allSettled(feedPromises)
    
    // Combine all successful results
    const allItems: NewsItem[] = []
    feedResults.forEach(result => {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value)
      }
    })
    
    // Sort by source name and then by recency
    return allItems
      .sort((a, b) => {
        // First sort by source
        if (a.source !== b.source) {
          return a.source.localeCompare(b.source)
        }
        // Then by time (newest first)
        return a.publishedAt.localeCompare(b.publishedAt)
      })
      .slice(0, 15) // Limit to 15 items total
      
  } catch (error) {
    console.error('Failed to fetch news feeds:', error)
    
    // Return fallback message
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