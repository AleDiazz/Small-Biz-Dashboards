import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ledgerai.com').replace(/\/$/, '')
  
  const routes = [
    '',
    '/pricing',
    '/faq',
    '/terms',
    '/privacy',
    '/contact',
    '/about',
    '/features',
    '/login',
    '/signup',
    // Legal pages
    '/legal/terms-of-service',
    '/legal/privacy-policy',
    '/legal/refund-policy',
    '/legal/cookie-policy',
    '/legal/data-processing-addendum',
    '/legal/acceptable-use-policy',
    '/legal/sla',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))
}

