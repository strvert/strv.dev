import { defineNuxtConfig } from '@nuxt/bridge';
import path from 'path';
import fs from 'fs';
import { $content } from '@nuxt/content';
import { pathToSlug } from './composables/utils/ConvertArticlePath.ts';

import remarkCodeExtraConfig from './remark_code_extra.config';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const baseDir = process.env.BASE_DIR || '/';
const basePath = baseUrl + baseDir;

const lang = 'ja';
const locale = 'ja_jp';
const siteName = 'strv.dev';
const siteDesc = 'すとんりばーのポートフォリオ 兼 技術ブログ 兼 遊び場';
const copyright = {
  rights: 'stonriver (Riku Ishikawa)',
  year: '2021',
};

const ogpImages = basePath + 'images/ogp';
const articlesPath = 'articles';
const articlesRoute = 'blog';

const defaultMeta = [
  { charset: 'utf-8' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  { name: 'format-detection', content: 'telephone=no' },
  {
    hid: 'description',
    name: 'description',
    content: siteDesc,
  },
  { hid: 'og:locale', property: 'og:locale', content: locale },
  { hid: 'og:site_name', property: 'og:site_name', content: siteName },
  { hid: 'og:type', property: 'og:type', content: 'article' },
  { hid: 'og:url', property: 'og:url', content: baseUrl },
  { hid: 'og:title', property: 'og:title', content: 'strv.dev' },
  {
    hid: 'og:description',
    property: 'og:description',
    content: siteDesc,
  },
  {
    hid: 'og:image',
    property: 'og:image',
    content: `${ogpImages}/main.png`,
  },
  {
    name: 'twitter:card',
    content: 'summary_large_image',
  },
  { name: 'twitter:creator', content: '@strvert' },
];

const defaultLink = [
  { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  { rel: 'apple-touch-icon', type: 'image/png', href: '/apple-touch-icon-180x180.png' },
  { rel: 'icon', type: 'image/png', href: '/icon-192x192.png' },
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
  {
    rel: 'stylesheet',
    href: 'https://cdn.iconmonstr.com/1.3.0/css/iconmonstr-iconic-font.min.css',
  },
];

const collectBlogPostURIs = async () => {
  const postsLoc = articlesPath;
  const posts = await $content(postsLoc, { deep: true }).only(['path']).fetch();
  return posts.map((post) => {
    return `${articlesRoute}/${pathToSlug(post.path, articlesPath)}`;
  });
};

const collectSitemapURIs = async () => {
  const postsLoc = articlesPath;
  const posts = await $content(postsLoc, { deep: true }).only(['path', 'updatedAt']).fetch();
  return posts.map((post) => {
    return {
      url: `${articlesRoute}/${pathToSlug(post.path, articlesPath)}`,
      lastmod: post.updatedAt,
    };
  });
};

export default defineNuxtConfig({
  bridge: {
    nitro: false,
    meta: true,
  },
  webpack: {
    watchOptions: {
      ignored: '/node_modules/',
    },
    stats: 'verbose',
  },
  env: {
    baseUrl,
    baseDir,
    basePath,
    siteName,
    siteDesc,
    ogpImages,
    lang,
    locale,
    copyright,
    articlesPath,
    articlesRoute,
    defaultMeta,
    defaultLink,
  },
  router: {
    // base: baseDir
  },
  server: {
    host: '0.0.0.0',
    port: '3000',
    https: {
      key: fs.readFileSync(path.resolve('./devcerts/172.21.77.8-key.pem')),
      cert: fs.readFileSync(path.resolve('./devcerts/172.21.77.8.pem')),
    },
  },
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  vue: {
    config: {
      productionTip: false,
      devtools: true,
    },
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    htmlAttrs: {
      lang,
      prefix: 'og: http://ogp.me/ns#',
    },
    titleTemplate: '%s - strv.dev',
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/css/thirdparty/sanitize.css',
    '~/assets/css/global.scss',
    '~/assets/css/transition.scss',
    '~/assets/css/blogpost.scss',
    '~/assets/css/variables.scss',
  ],

  pageTransition: 'page',
  layoutTransition: 'layout',

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['~/plugins/RepositoryFactory', '~/plugins/dayjs/dayjs', '~/plugins/prism'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    [
      '@nuxtjs/google-fonts',
      {
        families: {
          'M PLUS 1': [200, 300, 400, 600],
          'Source Code Pro': [300, 400],
        },
        display: 'swap',
      },
      '@nuxtjs/axios',
    ],
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/google-gtag',
    [
      'nuxt-content-git',
      {
        createdAtName: 'gitCreatedAt',
        updatedAtName: 'gitUpdatedAt',
      },
    ],
    './modules/timestampSelector',
    [
      './modules/articleAssetsResolver',
      {
        articleRoot: 'articles',
        articleAssetsRoot: '/article-assets',
      },
    ],
    '@nuxt/content',
    '@nuxtjs/sitemap',
    [
      './modules/ogpImageGenerator',
      {
        config: {
          output: {
            nameTemplate: '%s.png',
            path: path.join(process.cwd(), '/static/images/ogp/generated'),
          },
          resources: {
            get baseImagePath() {
              return path.join(process.cwd(), '/assets/images/ogp', 'article_base.png');
            },
            fontPath: path.join(process.cwd(), '/assets/fonts', 'MPLUS1p-ExtraBold.ttf'),
          },
          textStyle: {
            textOptions: {
              fontSize: 50,
              attributes: { fill: '#37424e' },
            },
            lineSpacing: 10,
            width: 900,
            position: (imageSize) => [imageSize[0] / 2, imageSize[1] / 2 - 90],
            textAlign: 'center',
            anchor: 'center middle',
          },
          contentPath: 'articles',
        },
      },
    ],
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    standalone: true,
    analyze: true,
    cache: true,
    parallel: true,
    hardSource: true,
  },
  content: {
    markdown: {
      prism: {
        theme: 'prism-themes/themes/prism-one-light.css',
      },
      remarkPlugins: [['remark-code-extra', remarkCodeExtraConfig], 'remark-prism'],
      rehypePlugins: [],
    },
  },
  ssr: false,
  generate: {
    workers: 16,
    interval: 300,
    async routes() {
      return await collectBlogPostURIs();
    },
  },
  sitemap: {
    hostname: baseUrl,
    defaults: {
      priority: 0.5,
    },
    routes: async () => {
      const uris = await collectSitemapURIs();
      uris.push({ url: '/', priority: 1 });
      uris.push({ url: '/blog', priority: 0.8 });
      uris.push({ url: '/blog/series', priority: 0.4 });
      uris.push({ url: '/blog/search', priority: 0.4 });
      uris.push({ url: '/blog/about', priority: 0.3 });
      return uris;
    },
  },
  'google-gtag': {
    id: 'G-7CSGM5KZ9W',
    debug: true,
  },
});
