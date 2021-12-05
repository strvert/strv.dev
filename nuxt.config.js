import { defineNuxtConfig } from '@nuxt/bridge';
import path from 'path';
import fs from 'fs';

import modules from './configs/modules';
import sitemap from './configs/sitemap';
import content from './configs/content';
import buildModules from './configs/buildmodules';
import {
  siteDesc,
  defaultMeta,
  lang,
  locale,
  siteName,
  copyright,
  baseUrl,
  baseDir,
  basePath,
  ogpImages,
  articlesPath,
  articlesRoute,
} from './configs/sitemeta';
import generate from './configs/generate';

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
  buildModules: buildModules,

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: modules,

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    standalone: true,
    analyze: true,
    cache: true,
    parallel: true,
    hardSource: true,
  },
  content: content,
  ssr: false,
  generate: generate(articlesRoute, articlesPath),
  sitemap: sitemap(baseUrl, articlesRoute),
  'google-gtag': {
    id: 'G-7CSGM5KZ9W',
    debug: true,
  },
});
