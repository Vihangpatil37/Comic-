import { MetadataRoute } from 'next'
import { fetchComics } from '../lib/api-client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://comicarchive.vercel.app'
  
  // Base sitemap entries
  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  try {
    // Fetch all comics (assuming fetchComics fetches a default page, 
    // for a complete sitemap you might need a dedicated endpoint to fetch all slugs)
    const { comics } = await fetchComics()
    
    const comicEntries: MetadataRoute.Sitemap = comics.map((comic) => ({
      url: `${baseUrl}/comic/${comic.slug}`,
      lastModified: comic.publishedAt ? new Date(comic.publishedAt) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }))
    
    return [...entries, ...comicEntries]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return entries
  }
}
