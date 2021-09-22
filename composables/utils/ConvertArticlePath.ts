import { contentFunc } from '@nuxt/content/types/content';

export const articles_dir = process.env.articlesPath as string;

export const correntDuplicatePaths = (path: string) => {
  while (path.includes('//')) {
    path = path.replace('//', '/');
  }
  return path;
};

export const slugToPath = (slug: string) => {
  return correntDuplicatePaths('/' + articles_dir + '/' + slug.replace('--', '/'));
};

export const pathToSlug = (path: string) => {
  path = correntDuplicatePaths(path);
  return path.substr(articles_dir.length + 2).replace('/', '--');
};
