import path from 'path';

const modules = [
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
];

export default modules;
