export const getSeo = (seo: Seo, defaultSeo: Seo, pageTitle: string | null = null) => {
    const title = seo?.title || pageTitle || defaultSeo.title;
    const description = seo?.description || defaultSeo.description;
    const robots = seo?.advanced?.robots || defaultSeo.advanced?.robots || ["index", "follow"];
    return {
        title,
        description,
        openGraph: {
            basic: {
                type: 'website',
                title:
                    seo?.social?.facebook?.title ||
                    defaultSeo.social?.facebook?.title ||
                    title ||
                    '',
                description:
                    seo?.social?.facebook?.description ||
                    defaultSeo.social?.facebook?.description ||
                    description,
                image:
                    seo?.social?.facebook?.image?.url ||
                    defaultSeo.social?.facebook?.image?.url ||
                    ''
            }
        },
        twitter: {
            creator: seo?.social?.twitter?.creator || defaultSeo.social?.twitter?.creator,
            image: seo?.social?.twitter?.image?.url || defaultSeo.social?.twitter?.image?.url,
            title: seo?.social?.twitter?.title || defaultSeo.social?.twitter?.title || title,
            description:
                seo?.social?.twitter?.description ||
                defaultSeo.social?.twitter?.description ||
                description
        },
        canonical: seo?.advanced?.canonical || defaultSeo.advanced?.canonical,
        noindex: robots.includes("noindex"),
        nofollow: robots.includes("nofollow"),
        extend: robots.length > 0 ? {
            meta: [
                { name: 'robots', content: robots.join(",") }
            ]
        } : {}
    };
};
