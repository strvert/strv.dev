export const articles_dir = process.env.articlesPath as string;

export const correntDuplicatePaths = (path: string) => {
  while (path.includes('//')) {
    path = path.replace('//', '/');
  }
  return path;
};

export const slugToPath = (slug: string, basedir: string = articles_dir) => {
  return correntDuplicatePaths(`/${basedir}/${slug.replace('--', '/')}`);
};

export const pathToSlug = (path: string, basedir: string = articles_dir) => {
  path = correntDuplicatePaths(path);
  return path.substr(basedir.length + 2).replace('/', '--');
};
