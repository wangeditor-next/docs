import { createRequire } from 'module';
import { defineConfig, type DefaultTheme } from 'vitepress';

const require = createRequire(import.meta.url);
const pkg = require('@wangeditor-next/editor/package.json');

export const en = defineConfig({
    lang: 'en-US',
    description: 'Open-source Rich Text Editor',

    themeConfig: {
        nav: nav(),

        sidebar: {
            '/en/guide/': { base: '/en/guide/', items: sidebarGuide() },
        },

        editLink: {
            pattern:
                'https://github.com/wangeditor-next/docs/tree/main/docs/:path',
            text: 'Edit this page on GitHub',
        },

        footer: {
            message: 'Released under the MIT License',
            copyright: `Copyright © 2024-${new Date().getFullYear()} Yao Longfei`,
        },

        docFooter: {
            prev: 'Previous page',
            next: 'Next page',
        },

        outline: {
            label: 'Table of Contents',
        },

        lastUpdated: {
            text: 'Last updated on',
            formatOptions: {
                dateStyle: 'short',
                timeStyle: 'medium',
            },
        },

        langMenuLabel: 'Languages',
        returnToTopLabel: 'Return to top',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Theme',
        lightModeSwitchTitle: 'Switch to light mode',
        darkModeSwitchTitle: 'Switch to dark mode',
    },
});

function nav(): DefaultTheme.NavItem[] {
    return [
        {
            text: 'Guide',
            link: '/en/guide/getting-started',
            activeMatch: '/en/guide/',
        },
        {
            text: 'demo',
            link: 'https://wangeditor-next.github.io/demo/',
        },
        {
            text: pkg.version,
            items: [
                {
                    text: 'Changelog',
                    link: 'https://github.com/wangeditor-next/wangEditor-next/blob/master/CHANGELOG.md',
                },
                {
                    text: 'Contributing',
                    link: 'https://github.com/wangeditor-next/wangEditor-next/blob/master/CONTRIBUTING.md',
                },
            ],
        },
    ];
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
    return [
        {
            text: 'Introduction',
            collapsed: false,
            link: '/',
        },
        {
            text: 'Installation',
            collapsed: false,
            link: '/installation',
        },
        {
            text: 'Basics',
            collapsed: false,
            items: [
                { text: 'Getting Started', link: '/getting-started' },
                { text: 'For Vue React', link: '/for-frame' },
                { text: 'Content Handling', link: '/content' },
            ],
        },
        {
            text: 'Configuration and API',
            collapsed: false,
            items: [
                { text: 'Toolbar Configuration', link: '/toolbar-config' },
                { text: 'Editor Configuration', link: '/editor-config' },
                { text: 'CSP Class Style Mode', link: '/csp-class-mode' },
                { text: 'Menu Configuration', link: '/menu-config' },
                { text: 'Editor API', link: '/API' },
            ],
        },
        {
            text: 'Advanced',
            collapsed: false,
            items: [
                { text: 'Node Data Structure', link: '/node-define' },
                { text: 'Custom Extensions', link: '/development' },
                { text: 'Internationalization', link: '/i18n' },
                { text: 'Theme', link: '/theme' },
                { text: 'For Typescript', link: '/for-ts' },
                { text: 'Plugins', link: '/plugins' },
            ],
        },
        {
            text: 'Resources',
            collapsed: false,
            items: [
                { text: 'AI Full Markdown (English)', link: '/ai/en-guide-full.txt' },
                { text: 'AI Full Markdown (中文)', link: '/ai/zh-guide-full.txt' },
                { text: 'Video Tutorials', link: '/video-course' },
            ],
        },
    ];
}

export const search: DefaultTheme.AlgoliaSearchOptions['locales'] = {
    en: {
        placeholder: 'Search documentation',
        translations: {
            button: {
                buttonText: 'Search documentation',
                buttonAriaLabel: 'Search documentation',
            },
            modal: {
                searchBox: {
                    resetButtonTitle: 'Clear the query',
                    resetButtonAriaLabel: 'Clear the query',
                    cancelButtonText: 'Cancel',
                    cancelButtonAriaLabel: 'Cancel',
                },
                startScreen: {
                    recentSearchesTitle: 'Recent searches',
                    noRecentSearchesText: 'No recent searches',
                    saveRecentSearchButtonTitle: 'Save to recent searches',
                    removeRecentSearchButtonTitle:
                        'Remove from recent searches',
                    favoriteSearchesTitle: 'Favorites',
                    removeFavoriteSearchButtonTitle: 'Remove from favorites',
                },
                errorScreen: {
                    titleText: 'Unable to fetch results',
                    helpText: 'You might need to check your network connection',
                },
                footer: {
                    selectText: 'Select',
                    navigateText: 'Navigate',
                    closeText: 'Close',
                    searchByText: 'Search provided by',
                },
                noResultsScreen: {
                    noResultsText: 'No results found',
                    suggestedQueryText: 'You might try',
                    reportMissingResultsText:
                        'Think this query should have results?',
                    reportMissingResultsLinkText: 'Click to provide feedback',
                },
            },
        },
    },
};
