import { createRequire } from 'module';
import { defineConfig, type DefaultTheme } from 'vitepress';

const require = createRequire(import.meta.url);
const pkg = require('@wangeditor-next/editor/package.json');

export const zh = defineConfig({
    lang: 'zh-Hans',
    description: '开源富文本编辑器',

    themeConfig: {
        nav: nav(),

        sidebar: {
            '/guide/': { base: '/guide/', items: sidebarGuide() },
        },

        editLink: {
            pattern:
                'https://github.com/wangeditor-next/docs/tree/main/docs/:path',
            text: '在 GitHub 上编辑此页面',
        },

        footer: {
            message: '基于 MIT 许可发布',
            copyright: `版权所有 © 2024-${new Date().getFullYear()} 姚龙飞`,
        },

        docFooter: {
            prev: '上一页',
            next: '下一页',
        },

        outline: {
            label: '页面导航',
        },

        lastUpdated: {
            text: '最后更新于',
            formatOptions: {
                dateStyle: 'short',
                timeStyle: 'medium',
            },
        },

        langMenuLabel: '多语言',
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
    },
});

function nav(): DefaultTheme.NavItem[] {
    return [
        {
            text: '指南',
            link: '/guide/getting-started',
            activeMatch: '/zh/guide/',
        },
        {
            text: '示例',
            link: 'https://wangeditor-next.github.io/demo/',
        },
        {
            text: pkg.version,
            items: [
                {
                    text: '更新日志',
                    link: 'https://github.com/wangeditor-next/wangEditor-next/blob/master/CHANGELOG.md',
                },
                {
                    text: '参与贡献',
                    link: 'https://github.com/wangeditor-next/wangEditor-next/blob/master/CONTRIBUTING.md',
                },
            ],
        },
    ];
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
    return [
        {
            text: '简介',
            collapsed: false,
            link: '/',
        },
        {
            text: '安装',
            collapsed: false,
            link: '/installation',
        },
        {
            text: '基础',
            collapsed: false,
            items: [
                { text: '快速开始', link: '/getting-started' },
                { text: '用于 Vue React', link: '/for-frame' },
                { text: '内容处理', link: '/content' },
            ],
        },
        {
            text: '配置和 API',
            collapsed: false,
            items: [
                { text: '工具栏配置', link: '/toolbar-config' },
                { text: '编辑器配置', link: '/editor-config' },
                { text: 'CSP class 样式模式', link: '/csp-class-mode' },
                { text: '菜单配置', link: '/menu-config' },
                { text: '编辑器 API', link: '/API' },
            ],
        },
        {
            text: '高级',
            collapsed: false,
            items: [
                { text: '节点数据结构', link: '/node-define' },
                { text: '自定义扩展新功能', link: '/development' },
                { text: '多语言', link: '/i18n' },
                { text: '主题', link: '/theme' },
                { text: '用于 Typescript', link: '/for-ts' },
                { text: '插件', link: '/plugins' },
            ],
        },
        {
            text: '资源',
            collapsed: false,
            items: [
                { text: 'AI 全量 Markdown（中文）', link: '/ai/zh-guide-full.txt' },
                { text: 'AI 全量 Markdown（English）', link: '/ai/en-guide-full.txt' },
                { text: '视频教程', link: '/video-course' },
            ],
        },
    ];
}

export const search: DefaultTheme.AlgoliaSearchOptions['locales'] = {
    zh: {
        placeholder: '搜索文档',
        translations: {
            button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
            },
            modal: {
                searchBox: {
                    resetButtonTitle: '清除查询条件',
                    resetButtonAriaLabel: '清除查询条件',
                    cancelButtonText: '取消',
                    cancelButtonAriaLabel: '取消',
                },
                startScreen: {
                    recentSearchesTitle: '搜索历史',
                    noRecentSearchesText: '没有搜索历史',
                    saveRecentSearchButtonTitle: '保存至搜索历史',
                    removeRecentSearchButtonTitle: '从搜索历史中移除',
                    favoriteSearchesTitle: '收藏',
                    removeFavoriteSearchButtonTitle: '从收藏中移除',
                },
                errorScreen: {
                    titleText: '无法获取结果',
                    helpText: '你可能需要检查你的网络连接',
                },
                footer: {
                    selectText: '选择',
                    navigateText: '切换',
                    closeText: '关闭',
                    searchByText: '搜索提供者',
                },
                noResultsScreen: {
                    noResultsText: '无法找到相关结果',
                    suggestedQueryText: '你可以尝试查询',
                    reportMissingResultsText: '你认为该查询应该有结果？',
                    reportMissingResultsLinkText: '点击反馈',
                },
            },
        },
    },
};
