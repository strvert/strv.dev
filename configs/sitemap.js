import { pathToSlug } from '../composables/utils/ConvertArticlePath.ts';
import { $content } from '@nuxt/content';

const collectSitemapURIs = async (articlesRoute, articlesPath) => {
  const postsLoc = articlesPath;
  const posts = await $content(postsLoc, { deep: true }).only(['path', 'updatedAt']).fetch();
  return posts.map((post) => {
    return {
      url: `${articlesRoute}/${pathToSlug(post.path, articlesPath)}/`,
      lastmod: post.updatedAt,
    };
  });
};

const sitemap = (baseUrl, articlesRoute, articlesPath) => {
  return {
    hostname: baseUrl,
    defaults: {
      priority: 0.5,
    },
    routes: async () => {
      const uris = await collectSitemapURIs(articlesRoute, articlesPath);
      uris.push({ url: '/', priority: 1 });
      uris.push({ url: '/blog/', priority: 0.8 });
      uris.push({ url: '/blog', priority: 0.8 });
      uris.push({ url: '/blog/series/', priority: 0.4 });
      uris.push({ url: '/blog/series', priority: 0.4 });
      uris.push({ url: '/blog/search/', priority: 0.4 });
      uris.push({ url: '/blog/search', priority: 0.4 });
      uris.push({ url: '/about/', priority: 0.3 });
      uris.push({ url: '/about', priority: 0.3 });
      return uris;
    },
  };
};

export default sitemap;
