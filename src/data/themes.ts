// src/data/themes.ts
// Single source of truth for per-page color schemes.
// Each theme is a set of CSS custom property values applied to <body>
// and mirrored as data-* attributes on #swup for Swup page transitions.

export interface Theme {
    primaryColor: string;
    primaryContrastColor: string;
    secondaryColor: string;
    secondaryContrastColor: string;
    tertiaryColor: string;
    tertiaryContrastColor: string;
    quaternaryColor: string;
    quaternaryContrastColor: string;
}

export const themes = {
    index: {
        primaryColor: '#e4c787',
        primaryContrastColor: '#192727',
        secondaryColor: '#9ab28a',
        secondaryContrastColor: '#593636',
        tertiaryColor: '#c8a8a8',
        tertiaryContrastColor: '#2a3a4a',
        quaternaryColor: '#c4a8b8',
        quaternaryContrastColor: '#3a2d2d',
    },
    about: {
        primaryColor: '#593636',
        primaryContrastColor: '#e4c787',
        secondaryColor: '#F2E2C0',
        secondaryContrastColor: '#945442',
        tertiaryColor: '#9ab28a',
        tertiaryContrastColor: '#192727',
        quaternaryColor: '#9ab28a',
        quaternaryContrastColor: '#593636',
    },
    contact: {
        primaryColor: '#2a2d17',
        primaryContrastColor: '#e4c787',
        secondaryColor: '#e4c787',
        secondaryContrastColor: '#192727',
        tertiaryColor: '#F2E2C0',
        tertiaryContrastColor: '#945442',
        quaternaryColor: '#9ab28a',
        quaternaryContrastColor: '#593636',
    },
    projects: {
        primaryColor: '#192727',
        primaryContrastColor: '#e4c787',
        secondaryColor: '#9ab28a',
        secondaryContrastColor: '#593636',
        tertiaryColor: '#bbb387',
        tertiaryContrastColor: '#313804',
        quaternaryColor: '#c4a8b8',
        quaternaryContrastColor: '#3a2d2d',
    },
    resume: {
        primaryColor: '#bbb387',
        primaryContrastColor: '#192727',
        secondaryColor: '#192727',
        secondaryContrastColor: '#A2B690',
        tertiaryColor: '#e4c787',
        tertiaryContrastColor: '#593636',
        quaternaryColor: '#9ab28a',
        quaternaryContrastColor: '#593636',
    },
    work: {
        primaryColor: '#9ab28a',
        primaryContrastColor: '#593636',
        secondaryColor: '#C2BA93',
        secondaryContrastColor: '#2A2F04',
        tertiaryColor: '#e4c787',
        tertiaryContrastColor: '#192727',
        quaternaryColor: '#c8a8a8',
        quaternaryContrastColor: '#3a2d2d',
    },
} satisfies Record<string, Theme>;

export type ThemeKey = keyof typeof themes;