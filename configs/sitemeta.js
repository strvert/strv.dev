export const lang = 'ja';
export const locale = 'ja_jp';
export const siteName = 'strv.dev';
export const siteDesc = 'すとんりばーのポートフォリオ 兼 技術ブログ 兼 遊び場';
export const copyright = {
  rights: 'stonriver (Riku Ishikawa)',
  year: '2021',
};

export const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
export const baseDir = process.env.BASE_DIR || '/';
export const basePath = baseUrl + baseDir;

export const ogpImages = basePath + 'images/ogp';
export const articlesPath = 'articles';
export const articlesRoute = 'blog';

export const defaultMeta = [
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
