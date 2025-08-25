import metaImage from '@images/meta.png';

export const defaultSeo: Seo = {
    title: 'leostrangman.com',
    description: 'Leo Strangman/Leonel Strangman - Web developer, designer, and creator. Portfolio, projects, and contact info.',
    social: {
        facebook: {
            title: 'leostrangman.com',
            image: {
                url: metaImage.src
            },
            description: 'Leo Strangman/Leonel Strangman - Web developer, designer, and creator. Portfolio, projects, and contact info.',
        },
        twitter: {
            creator: '@leostrangman',
            title: 'leostrangman.com',
            image: {
                url: metaImage.src
            },
            description: 'Leo Strangman/Leonel Strangman - Web developer, designer, and creator. Portfolio, projects, and contact info.'
        }
    },
    advanced: {
        canonical: 'https://leostrangman.com'
    }
};
