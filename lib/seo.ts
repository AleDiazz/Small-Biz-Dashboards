import { Metadata } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ledgerai.com').replace(/\/$/, '')
const siteName = 'LedgerAI'
const defaultDescription = 'Track expenses, revenue, and inventory for your small business in Puerto Rico. Simple, powerful tools designed for food trucks, salons, trainers, boutiques, and more.'

export interface SEOConfig {
  title?: string
  description?: string
  path?: string
  image?: string
  noindex?: boolean
  nofollow?: boolean
  keywords?: string | string[]
}

export function generateMetadata({
  title,
  description = defaultDescription,
  path = '',
  image = '/og-image.jpg',
  noindex = false,
  nofollow = false,
  keywords,
}: SEOConfig): Metadata {
  const fullTitle = title ? `${siteName} – ${title}` : `${siteName} - AI-Powered Business Dashboard`
  const url = `${siteUrl}${path}`
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`

  return {
    title: fullTitle,
    description,
    keywords: keywords ? (Array.isArray(keywords) ? keywords.join(', ') : keywords) : undefined,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export function generateStructuredData(type: 'Organization' | 'Product' | 'WebSite' | 'BreadcrumbList', data?: any) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
  }

  switch (type) {
    case 'Organization':
      return {
        ...baseData,
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description: defaultDescription,
        sameAs: [
          'https://facebook.com/ledgerai',
          'https://instagram.com/ledgerai',
          'https://tiktok.com/@ledgerai',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          email: 'support@ledgerai.com',
        },
        ...data,
      }
    
    case 'Product':
      return {
        ...baseData,
        name: siteName,
        description: defaultDescription,
        brand: {
          '@type': 'Brand',
          name: siteName,
        },
        offers: {
          '@type': 'AggregateOffer',
          offerCount: 3,
          lowPrice: '15',
          highPrice: '50',
          priceCurrency: 'USD',
        },
        ...data,
      }
    
    case 'WebSite':
      return {
        ...baseData,
        name: siteName,
        url: siteUrl,
        description: defaultDescription,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        ...data,
      }
    
    case 'BreadcrumbList':
      return {
        ...baseData,
        itemListElement: data?.items || [],
      }
    
    default:
      return baseData
  }
}

