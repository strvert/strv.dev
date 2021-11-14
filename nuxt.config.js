import { defineNuxtConfig } from '@nuxt/bridge';
import path from 'path';
import { $content } from '@nuxt/content';
import { pathToSlug } from './composables/utils/ConvertArticlePath.ts';

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

const authorInfo = {
  twitter: 'strvert',
  github: 'strvert',
};

const ogpImages = basePath + 'images/ogp';
const articlesPath = 'articles';
const articlesRoute = 'blog';

const collectBlogPostURIs = async () => {
  const postsLoc = articlesPath;
  const posts = await $content(postsLoc, { deep: true }).only(['path']).fetch();
  return posts.map((post) => {
    return `${articlesRoute}/${pathToSlug(post.path, articlesPath)}`;
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
    authorInfo,
    articlesPath,
    articlesRoute,
  },
  router: {
    // base: baseDir
  },
  server: {
    host: '0.0.0.0',
    port: '3000',
  },
  // Target: https://go.nuxtjs.dev/config-target
  ssr: true,
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
    },
    titleTemplate: '%s - strv.dev',
    meta: [
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
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', type: 'image/png', href: '/apple-touch-icon-180x180.png' },
      { rel: 'icon', type: 'image/png', href: '/icon-192x192.png' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
      {
        rel: 'stylesheet',
        href: 'https://cdn.iconmonstr.com/1.3.0/css/iconmonstr-iconic-font.min.css',
      },
    ],
    script: [],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/css/thirdparty/sanitize.css',
    '~/assets/css/global.scss',
    '~/assets/css/blogpost.scss',
    '~/assets/css/variables.scss',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['~/plugins/RepositoryFactory'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    [
      '@nuxtjs/google-fonts',
      {
        families: {
          'M PLUS Rounded 1c': [300, 400, 500],
          'Source Code Pro': [300, 400],
        },
        display: 'swap',
      },
    ],
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    'nuxt-content-git',
    '@nuxt/content',
    '@nuxtjs/sitemap',
    [
      '~/modules/ogpImageGenerator',
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
    analyze: true,
    cache: true,
    parallel: true,
    hardSource: true,
  },
  content: {
    markdown: {},
  },
  generate: {
    workers: 16,
    interval: 2000,
    async routes() {
      return await collectBlogPostURIs();
    },
  },
  sitemap: {
    hostname: baseUrl,
    routes: async () => {
      return await collectBlogPostURIs();
    },
  },
});
