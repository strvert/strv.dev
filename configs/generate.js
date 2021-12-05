import { pathToSlug } from '../composables/utils/ConvertArticlePath.ts';
import { $content } from '@nuxt/content';

const collectBlogPostURIs = async (articlesRoute, articlesPath) => {
  const postsLoc = articlesPath;
  const posts = await $content(postsLoc, { deep: true }).only(['path']).fetch();
  return posts.map((post) => {
    return `${articlesRoute}/${pathToSlug(post.path, articlesPath)}`;
  });
};

const generate = (articlesRoute, articlesPath) => {
  return {
    workers: 16,
    interval: 300,
    async routes() {
      return await collectBlogPostURIs(articlesRoute, articlesPath);
    },
  };
};

export default generate;
