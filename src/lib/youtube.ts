export type YouTubeVideo = {
  id: string
  title: string
  channelTitle: string
  url: string
}

export async function searchYouTube(query: string, maxResults = 3): Promise<YouTubeVideo[]> {
  const key = process.env.YOUTUBE_API_KEY
  // If no API key is configured and we are in development, return a small
  // curated list of sample videos so UI features (like guide suggestions)
  // are visible during local development. Do NOT return fallback videos
  // in production.
  // Only return demo videos when explicitly running in development mode.
  // Keep test and production behaviour unchanged so tests and deployments are deterministic.
  if (!key && process.env.NODE_ENV === 'development') {
    console.warn('YOUTUBE_API_KEY not set — using demo fallback videos for development environment')
    const DEMO_VIDEOS: YouTubeVideo[] = [
      { id: 'FwRdEx53b8', title: 'English Grammar: 12 Tenses (Examples + Exercises)', channelTitle: 'Learn English with Emma', url: 'https://www.youtube.com/watch?v=FwRdEx53b8' },
      { id: 'LKnqECcg6Gw', title: 'How to Improve your English Pronunciation', channelTitle: 'Pronunciation Studio', url: 'https://www.youtube.com/watch?v=LKnqECcg6Gw' },
      { id: 'eV3Gi2Yq1Jk', title: 'Present Perfect vs Simple Past', channelTitle: 'English Lessons', url: 'https://www.youtube.com/watch?v=eV3Gi2Yq1Jk' },
    ]
    return DEMO_VIDEOS.slice(0, Math.max(1, Math.min(maxResults, DEMO_VIDEOS.length)))
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: String(maxResults),
    key: key || '',
  })

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`)
    if (!res.ok) return []
    const data = await res.json()
    if (!data.items || !Array.isArray(data.items)) return []

    return data.items.map((it: any) => ({
      id: it.id.videoId,
      title: it.snippet?.title || 'Untitled',
      channelTitle: it.snippet?.channelTitle || '',
      url: `https://www.youtube.com/watch?v=${it.id.videoId}`,
    }))
  } catch (err) {
    console.warn('youtube.search error', err)
    return []
  }
}
