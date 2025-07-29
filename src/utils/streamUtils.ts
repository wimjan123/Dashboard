export interface StreamSource {
  id: string
  name: string
  url: string
  embedUrl: string
  type: 'youtube' | 'twitch' | 'vimeo' | 'custom' | 'hls' | 'rtmp'
  thumbnail?: string
  category?: string
  isLive?: boolean
  description?: string
  createdAt: string
}

export interface StreamCategory {
  id: string
  name: string
  color: string
  icon: string
}

export const DEFAULT_CATEGORIES: StreamCategory[] = [
  { id: 'gaming', name: 'Gaming', color: 'bg-purple-500', icon: '🎮' },
  { id: 'music', name: 'Music', color: 'bg-pink-500', icon: '🎵' },
  { id: 'news', name: 'News', color: 'bg-blue-500', icon: '📺' },
  { id: 'educational', name: 'Educational', color: 'bg-green-500', icon: '📚' },
  { id: 'entertainment', name: 'Entertainment', color: 'bg-yellow-500', icon: '🍿' },
  { id: 'tech', name: 'Technology', color: 'bg-cyan-500', icon: '💻' },
  { id: 'sports', name: 'Sports', color: 'bg-orange-500', icon: '⚽' },
  { id: 'other', name: 'Other', color: 'bg-gray-500', icon: '📡' }
]

export const detectStreamType = (url: string): 'youtube' | 'twitch' | 'vimeo' | 'custom' => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('twitch.tv')) return 'twitch'
  if (url.includes('vimeo.com')) return 'vimeo'
  return 'custom'
}

export const convertToEmbedUrl = (url: string): string => {
  const type = detectStreamType(url)
  
  switch (type) {
    case 'youtube':
      // Handle various YouTube URL formats
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const youtubeMatch = url.match(youtubeRegex)
      if (youtubeMatch) {
        const videoId = youtubeMatch[1]
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`
      }
      // Handle channel URLs
      if (url.includes('/channel/') || url.includes('/c/') || url.includes('/@')) {
        const channelRegex = /(?:channel\/|c\/|@)([^\/\?]+)/
        const channelMatch = url.match(channelRegex)
        if (channelMatch) {
          return `https://www.youtube.com/embed/live_stream?channel=${channelMatch[1]}&autoplay=1&mute=1`
        }
      }
      break
      
    case 'twitch':
      // Handle Twitch channel URLs
      const twitchRegex = /twitch\.tv\/([^\/\?]+)/
      const twitchMatch = url.match(twitchRegex)
      if (twitchMatch) {
        const channel = twitchMatch[1]
        return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&autoplay=true&muted=true`
      }
      break
      
    case 'vimeo':
      // Handle Vimeo URLs
      const vimeoRegex = /vimeo\.com\/(?:.*\/)?(\d+)/
      const vimeoMatch = url.match(vimeoRegex)
      if (vimeoMatch) {
        const videoId = vimeoMatch[1]
        return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1`
      }
      break
      
    default:
      // For custom streams, return as-is (assuming it's already an embed URL)
      return url
  }
  
  return url
}

export const extractVideoId = (url: string): string | null => {
  const type = detectStreamType(url)
  
  switch (type) {
    case 'youtube':
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const youtubeMatch = url.match(youtubeRegex)
      return youtubeMatch ? youtubeMatch[1] : null
      
    case 'twitch':
      const twitchRegex = /twitch\.tv\/([^\/\?]+)/
      const twitchMatch = url.match(twitchRegex)
      return twitchMatch ? twitchMatch[1] : null
      
    case 'vimeo':
      const vimeoRegex = /vimeo\.com\/(?:.*\/)?(\d+)/
      const vimeoMatch = url.match(vimeoRegex)
      return vimeoMatch ? vimeoMatch[1] : null
      
    default:
      return null
  }
}

export const generateThumbnailUrl = (streamSource: StreamSource): string => {
  const { type, url } = streamSource
  const videoId = extractVideoId(url)
  
  switch (type) {
    case 'youtube':
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
      break
      
    case 'twitch':
      if (videoId) {
        // Twitch doesn't have a simple thumbnail API, using a placeholder
        return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${videoId.toLowerCase()}-320x180.jpg`
      }
      break
      
    case 'vimeo':
      // Vimeo thumbnails require API call, using placeholder for now
      return 'https://via.placeholder.com/320x180/1f2937/9ca3af?text=Vimeo'
      
    default:
      return 'https://via.placeholder.com/320x180/1f2937/9ca3af?text=Stream'
  }
  
  return 'https://via.placeholder.com/320x180/1f2937/9ca3af?text=Stream'
}

export const DEFAULT_STREAMS: StreamSource[] = [
  // News Streams
  {
    id: '1',
    name: 'BBC News Live',
    url: 'https://www.youtube.com/watch?v=9Auq9mYxFEE',
    embedUrl: 'https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'news',
    thumbnail: 'https://img.youtube.com/vi/9Auq9mYxFEE/maxresdefault.jpg',
    description: 'Live BBC News coverage',
    createdAt: new Date().toISOString(),
    isLive: true
  },
  {
    id: '2',
    name: 'CNN Live',
    url: 'https://www.youtube.com/watch?v=jNhh-OLzWlE',
    embedUrl: 'https://www.youtube.com/embed/jNhh-OLzWlE?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'news',
    thumbnail: 'https://img.youtube.com/vi/jNhh-OLzWlE/maxresdefault.jpg',
    description: 'CNN breaking news and live coverage',
    createdAt: new Date().toISOString(),
    isLive: true
  },
  {
    id: '3',
    name: 'Sky News Live',
    url: 'https://www.youtube.com/watch?v=9Auq9mYxFEE',
    embedUrl: 'https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'news',
    thumbnail: 'https://img.youtube.com/vi/9Auq9mYxFEE/maxresdefault.jpg',
    description: 'Sky News live breaking news',
    createdAt: new Date().toISOString(),
    isLive: true
  },

  // Music Streams
  {
    id: '4',
    name: 'Lofi Hip Hop Radio',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'music',
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
    description: 'Chill beats to relax and study to',
    createdAt: new Date().toISOString(),
    isLive: true
  },
  {
    id: '5',
    name: 'Jazz Radio',
    url: 'https://www.youtube.com/watch?v=kgx4WGK0oNU',
    embedUrl: 'https://www.youtube.com/embed/kgx4WGK0oNU?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'music',
    thumbnail: 'https://img.youtube.com/vi/kgx4WGK0oNU/maxresdefault.jpg',
    description: 'Smooth jazz music 24/7',
    createdAt: new Date().toISOString(),
    isLive: true
  },
  {
    id: '6',
    name: 'Classical Music',
    url: 'https://www.youtube.com/watch?v=jgpJVI3tDbY',
    embedUrl: 'https://www.youtube.com/embed/jgpJVI3tDbY?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'music',
    thumbnail: 'https://img.youtube.com/vi/jgpJVI3tDbY/maxresdefault.jpg',
    description: 'Beautiful classical music for focus',
    createdAt: new Date().toISOString(),
    isLive: true
  },
  {
    id: '7',
    name: 'Electronic Music Mix',
    url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    embedUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'music',
    thumbnail: 'https://img.youtube.com/vi/5qap5aO4i9A/maxresdefault.jpg',
    description: 'Upbeat electronic music 24/7',
    createdAt: new Date().toISOString(),
    isLive: true
  },

  // Educational Streams
  {
    id: '8',
    name: 'NASA Live - Earth from Space',
    url: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
    embedUrl: 'https://www.youtube.com/embed/21X5lGlDOfg?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'educational',
    thumbnail: 'https://img.youtube.com/vi/21X5lGlDOfg/maxresdefault.jpg',
    description: 'Live view of Earth from the International Space Station',
    createdAt: new Date().toISOString(),
    isLive: true
  },
  {
    id: '9',
    name: 'Khan Academy Live',
    url: 'https://www.youtube.com/watch?v=EuFSQ-gKkH4',
    embedUrl: 'https://www.youtube.com/embed/EuFSQ-gKkH4?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'educational',
    thumbnail: 'https://img.youtube.com/vi/EuFSQ-gKkH4/maxresdefault.jpg',
    description: 'Educational content and tutorials',
    createdAt: new Date().toISOString(),
    isLive: true
  },
  {
    id: '10',
    name: 'MIT OpenCourseWare',
    url: 'https://www.youtube.com/watch?v=QM1iUe6IofM',
    embedUrl: 'https://www.youtube.com/embed/QM1iUe6IofM?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'educational',
    thumbnail: 'https://img.youtube.com/vi/QM1iUe6IofM/maxresdefault.jpg',
    description: 'MIT lectures and courses',
    createdAt: new Date().toISOString(),
    isLive: true
  },

  // Gaming Streams
  {
    id: '11',
    name: 'Twitch Gaming Hub',
    url: 'https://www.twitch.tv/directory/game/Just%20Chatting',
    embedUrl: 'https://player.twitch.tv/?channel=ninja&parent=localhost&autoplay=true&muted=true',
    type: 'twitch',
    category: 'gaming',
    thumbnail: 'https://via.placeholder.com/320x180/9146ff/ffffff?text=Twitch',
    description: 'Popular gaming streams on Twitch',
    createdAt: new Date().toISOString(),
    isLive: true
  },
  {
    id: '12',
    name: 'Retro Gaming 24/7',
    url: 'https://www.youtube.com/watch?v=YslQ2625TR4',
    embedUrl: 'https://www.youtube.com/embed/YslQ2625TR4?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'gaming',
    thumbnail: 'https://img.youtube.com/vi/YslQ2625TR4/maxresdefault.jpg',
    description: 'Classic retro games streaming',
    createdAt: new Date().toISOString(),
    isLive: true
  },

  // Entertainment Streams
  {
    id: '13',
    name: 'Relaxing Nature Sounds',
    url: 'https://www.youtube.com/watch?v=ScNNfyq3d_w',
    embedUrl: 'https://www.youtube.com/embed/ScNNfyq3d_w?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'entertainment',
    thumbnail: 'https://img.youtube.com/vi/ScNNfyq3d_w/maxresdefault.jpg',
    description: 'Peaceful nature sounds for relaxation',
    createdAt: new Date().toISOString(),
    isLive: true
  },
  {
    id: '14',
    name: 'Fireplace & Rain Sounds',
    url: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
    embedUrl: 'https://www.youtube.com/embed/L_LUpnjgPso?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'entertainment',
    thumbnail: 'https://img.youtube.com/vi/L_LUpnjgPso/maxresdefault.jpg',
    description: 'Cozy fireplace with rain sounds',
    createdAt: new Date().toISOString(),
    isLive: true
  },
  {
    id: '15',
    name: 'Aquarium Live Cam',
    url: 'https://www.youtube.com/watch?v=bnVmHbJU6-g',
    embedUrl: 'https://www.youtube.com/embed/bnVmHbJU6-g?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'entertainment',
    thumbnail: 'https://img.youtube.com/vi/bnVmHbJU6-g/maxresdefault.jpg',
    description: 'Relaxing aquarium live stream',
    createdAt: new Date().toISOString(),
    isLive: true
  },

  // Technology Streams
  {
    id: '16',
    name: 'Coding Radio',
    url: 'https://www.youtube.com/watch?v=YBYzOKBFUQw',
    embedUrl: 'https://www.youtube.com/embed/YBYzOKBFUQw?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'tech',
    thumbnail: 'https://img.youtube.com/vi/YBYzOKBFUQw/maxresdefault.jpg',
    description: 'Programming music and coding streams',
    createdAt: new Date().toISOString(),
    isLive: true
  },
  {
    id: '17',
    name: 'Tech Conference Live',
    url: 'https://www.youtube.com/watch?v=QM1iUe6IofM',
    embedUrl: 'https://www.youtube.com/embed/QM1iUe6IofM?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'tech',
    thumbnail: 'https://img.youtube.com/vi/QM1iUe6IofM/maxresdefault.jpg',
    description: 'Live tech conferences and talks',
    createdAt: new Date().toISOString(),
    isLive: true
  },

  // Sports Streams
  {
    id: '18',
    name: 'ESPN Live',
    url: 'https://www.youtube.com/watch?v=jNhh-OLzWlE',
    embedUrl: 'https://www.youtube.com/embed/jNhh-OLzWlE?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'sports',
    thumbnail: 'https://img.youtube.com/vi/jNhh-OLzWlE/maxresdefault.jpg',
    description: 'Sports news and highlights',
    createdAt: new Date().toISOString(),
    isLive: true
  },
  {
    id: '19',
    name: 'Olympic Channel',
    url: 'https://www.youtube.com/watch?v=_cKReAaGaMk',
    embedUrl: 'https://www.youtube.com/embed/_cKReAaGaMk?autoplay=1&mute=1&rel=0',
    type: 'youtube',
    category: 'sports',
    thumbnail: 'https://img.youtube.com/vi/_cKReAaGaMk/maxresdefault.jpg',
    description: 'Olympic sports and events',
    createdAt: new Date().toISOString(),
    isLive: true
  }
]

export const validateStreamUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' }
  }
  
  try {
    new URL(url)
  } catch {
    return { isValid: false, error: 'Invalid URL format' }
  }
  
  const type = detectStreamType(url)
  if (type === 'custom') {
    // For custom URLs, check if they look like streaming URLs
    const streamingPatterns = [
      /\.m3u8(\?|$)/i, // HLS
      /\.mpd(\?|$)/i,  // DASH
      /rtmp:\/\//i,    // RTMP
      /rtsp:\/\//i,    // RTSP
    ]
    
    const isStreamingUrl = streamingPatterns.some(pattern => pattern.test(url))
    if (!isStreamingUrl && !url.includes('embed')) {
      return { isValid: false, error: 'URL does not appear to be a valid streaming URL' }
    }
  }
  
  return { isValid: true }
}