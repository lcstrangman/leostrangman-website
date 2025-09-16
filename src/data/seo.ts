// src/data/seo.ts
import metaImage from '@images/meta.png';

export interface Seo {
  title?: string;
  description?: string;
  social?: {
    facebook?: {
      title?: string;
      description?: string;
      image?: { url: string };
    };
    twitter?: {
      creator?: string;
      title?: string;
      description?: string;
      image?: { url: string };
    };
  };
  advanced?: {
    canonical?: string;
    robots?: string[];
  };
}

export const defaultSeo: Seo = {
  title: 'leostrangman.com',
  description: 'Leo Strangman/Leonel Strangman - Web developer, designer, and creator. Portfolio, projects, and contact info.',
  social: {
    facebook: {
      title: 'leostrangman.com',
      description: 'Leo Strangman/Leonel Strangman - Web developer, designer, and creator. Portfolio, projects, and contact info.',
      image: { url: metaImage.src }
    },
    twitter: {
      creator: '@leostrangman',
      title: 'leostrangman.com',
      description: 'Leo Strangman/Leonel Strangman - Web developer, designer, and creator. Portfolio, projects, and contact info.',
      image: { url: metaImage.src }
    }
  },
  advanced: {
    canonical: 'https://leostrangman.com',
    robots: ['index', 'follow']
  }
};
