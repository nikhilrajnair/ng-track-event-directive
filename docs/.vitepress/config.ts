import { resolve } from 'node:path';

const docsBase = process.env.VITEPRESS_BASE || '/';
const docsAssetBase = docsBase.endsWith('/') ? docsBase : `${docsBase}/`;
const docsOutDir = process.env.VITEPRESS_OUT_DIR
  ? resolve(process.cwd(), process.env.VITEPRESS_OUT_DIR)
  : undefined;

export default {
  title: 'ng-track-event-directive',
  description: 'Declarative analytics event tracking for Angular apps',
  base: docsBase,
  outDir: docsOutDir,
  head: [
    [
      'link',
      { rel: 'icon', type: 'image/png', href: `${docsAssetBase}ng-track-event-shield-250.png` },
    ],
    ['link', { rel: 'apple-touch-icon', href: `${docsAssetBase}ng-track-event-shield-250.png` }],
    [
      'meta',
      {
        property: 'og:image',
        content:
          'https://nikhilrajnair.github.io/ng-track-event-directive/ng-track-event-shield-1024.png',
      },
    ],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    [
      'meta',
      {
        name: 'twitter:image',
        content:
          'https://nikhilrajnair.github.io/ng-track-event-directive/ng-track-event-shield-1024.png',
      },
    ],
  ],
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    logo: '/ng-track-event-shield-250.png',
    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/mixpanel' },
      { text: 'Demo', link: '/demo' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Adapter Setup', link: '/guide/adapter-setup' },
          { text: 'Events and Triggers', link: '/guide/events-and-triggers' },
        ],
      },
      {
        text: 'API',
        items: [{ text: 'API Reference', link: '/api/' }],
      },
      {
        text: 'Examples',
        items: [{ text: 'Mixpanel', link: '/examples/mixpanel' }],
      },
      {
        text: 'Demo',
        items: [{ text: 'Try The Demo', link: '/demo' }],
      },
    ],
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/nikhilrajnair/ng-track-event-directive' },
    ],
  },
};
