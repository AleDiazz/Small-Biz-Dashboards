import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ledgerai.com').replace(/\/$/, '')
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/login',
          '/signup',
          '/onboarding',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

