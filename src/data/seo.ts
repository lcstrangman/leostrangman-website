import metaImage from '@images/meta.png';

export const defaultSeo: Seo = {
    title: 'leostrangman.com',
    description: 'Personal portfolio website of Leo Strangman',
    social: {
        facebook: {
            title: 'leostrangman.com',
            image: {
                url: metaImage.src
            },
            description: 'Personal portfolio website of Leo Strangman'
        },
        twitter: {
            creator: '@leostrangman',
            title: 'leostrangman.com',
            image: {
                url: metaImage.src
            },
            description: 'Personal portfolio website of Leo Strangman'
        }
    },
    advanced: {
        robots: ['noindex', 'nofollow'],
        canonical: 'https://leostrangman.com'
    }
};
