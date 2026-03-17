import { defineConfig } from 'vitepress'
import { search as zhSearch } from './zh'

const siteUrl = 'https://wangeditor-next.github.io/docs/'
const ogImage = `${siteUrl}image/editor.png`

export const shared = defineConfig({
    title: 'wangEditor-next',

    rewrites: {
        'zh/:rest*': ':rest*'
    },
    base: '/docs/',
    lastUpdated: true,
    cleanUrls: true,
    metaChunk: true,

    markdown: {
        math: true,
        codeTransformers: [
            // We use `[!!code` in demo to prevent transformation, here we revert it back.
            {
                postprocess(code) {
                    return code.replace(/\[\!\!code/g, '[!code')
                }
            }
        ]
    },

    sitemap: {
        hostname: siteUrl,
        transformItems(items) {
            return items.filter((item) => !item.url.includes('migration'))
        }
    },

    /* prettier-ignore */
    head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/docs/image/logo.png' }],
        ['link', { rel: 'icon', type: 'image/png', href: '/docs/image/logo.png' }],
        ['meta', { name: 'theme-color', content: '#5f67ee' }],
        ['meta', { name: 'description', content: 'wangEditor-next 官方文档，包含安装、配置、API、插件与示例。' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:locale', content: 'zh_CN' }],
        ['meta', { property: 'og:title', content: 'wangEditor-next Docs' }],
        ['meta', { property: 'og:site_name', content: 'wangEditor-next' }],
        ['meta', { property: 'og:description', content: 'Open-source rich text editor documentation for wangEditor-next.' }],
        ['meta', { property: 'og:image', content: ogImage }],
        ['meta', { property: 'og:url', content: siteUrl }],
        ['script', { src: 'https://cdn.usefathom.com/script.js', 'data-site': 'AZBRSFGG', 'data-spa': 'auto', defer: '' }]
    ],

    themeConfig: {
        logo: { src: '/image/logo.png', width: 24, height: 24 },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/wangeditor-next/wangEditor-next' }
        ],

        search: {
            provider: 'local',
            options: {
                locales: { ...zhSearch }
            }
        }
    },
})
