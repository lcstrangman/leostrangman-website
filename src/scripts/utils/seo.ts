// src/scripts/utils/seo.ts
import type { Seo } from '@data/seo';
import type { Props as SeoProps } from 'astro-seo';

export const getSeo = (
  seo: Seo = {},
  defaultSeo: Seo,
  pageTitle: string | null = null,
  currentUrl?: string
): SeoProps => {
  const title = seo?.title || pageTitle || defaultSeo.title || '';
  const description = seo?.description || defaultSeo.description;
  const robots = seo?.advanced?.robots || defaultSeo.advanced?.robots || ["index", "follow"];
  const canonical = seo?.advanced?.canonical || currentUrl || defaultSeo.advanced?.canonical;

  return {
    title,
    description,
    canonical,
    noindex: robots.includes("noindex"),
    nofollow: robots.includes("nofollow"),
    extend: robots.length > 0 ? {
      meta: [
        { name: 'robots', content: robots.join(",") }
      ]
    } : {},
    openGraph: {
      basic: {
        title: seo?.social?.facebook?.title || defaultSeo.social?.facebook?.title || title,
        type: 'website',
        image: seo?.social?.facebook?.image?.url || defaultSeo.social?.facebook?.image?.url || '',
        url: canonical
      }
    },
    twitter: {
      creator: seo?.social?.twitter?.creator || defaultSeo.social?.twitter?.creator || '',
      title: seo?.social?.twitter?.title || defaultSeo.social?.twitter?.title || title,
      description: seo?.social?.twitter?.description || defaultSeo.social?.twitter?.description || description,
      image: seo?.social?.twitter?.image?.url || defaultSeo.social?.twitter?.image?.url || ''
    }
  };
};
