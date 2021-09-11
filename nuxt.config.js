const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const baseDir = process.env.BASE_DIR || "/";
const basePath = baseUrl + baseDir;

const lang = "ja";
const locale = "ja_jp";
const siteName = "strv.dev";
const siteDesc = "すとんりばーのポートフォリオ 兼 技術ブログ 兼 遊び場";

const ogpImages = basePath + "images/ogp/";

export default {
  env: {
    baseUrl,
    baseDir,
    basePath,
    siteName,
    siteDesc,
    ogpImages,
    lang,
    locale
  },
  router: {
    base: baseDir
  },
  // Target: https://go.nuxtjs.dev/config-target
  target: "static",

  vue: {
    config: {
      productionTip: false,
      devtools: true
    }
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    htmlAttrs: {
      lang
    },
    titleTemplate: "%s - strv.dev",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "format-detection", content: "telephone=no" },
      {
        hid: "description",
        name: "description",
        content: "すとんりばーのポートフォリオ 兼 技術ブログ 兼 遊び場"
      },
      { hid: "og:locale", property: "og:locale", content: locale },
      { hid: "og:site_name", property: "og:site_name", content: siteName },
      { hid: "og:type", property: "og:type", content: "article" },
      { hid: "og:url", property: "og:url", content: baseUrl },
      { hid: "og:title", property: "og:title", content: "strv.dev" },
      {
        hid: "og:description",
        property: "og:description",
        content: siteDesc
      },
      {
        hid: "og:image",
        property: "og:image",
        content: ogpImages + "main.png"
      },
      {
        name: "twitter:card",
        content: "summary_large_image"
      },
      { name: "twitter:creator", content: "@strvert" }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    "~/assets/css/thirdparty/sanitize.css",
    "~/assets/css/global.scss",
    "~/assets/css/variables.scss"
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    "@nuxt/typescript-build",
    "@nuxtjs/composition-api/module",
    [
      "@nuxtjs/google-fonts",
      {
        families: {
          "M PLUS Rounded 1c": [300, 400, 500]
        },
        display: "swap"
      }
    ]
  ],

  generate: {
    interval: 2000
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ["@nuxt/content", "~/modules/ogpImageGenerator"],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {}
};
