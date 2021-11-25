import { Module } from '#app';

const prefix = '#';

interface Options {
  articleRoot: string;
  articleAssetsRoot: string;
}

interface Element {
  type: string;
  tag?: string;
  children?: Array<Element>;
}

interface ImgElement extends Element {
  props: {
    alt: string;
    src: string;
  };
}

interface AElement extends Element {
  props: {
    href: string;
  };
}

const correntDuplicatePaths = (path: string) => {
  while (path.includes('//')) {
    path = path.replace('//', '/');
  }
  return path;
};

const removeBaseDir = (articlePath: string, basePath: string) => {
  const bp = `/${basePath}/`;
  if (articlePath.startsWith(bp)) {
    return articlePath.substr(bp.length);
  } else {
    throw new Error(`不正なパスに配置された記事が読み込まれました: ${articlePath}`);
  }
};

const checkPrefix = (target: string) => {
  return target.startsWith(`${prefix}/`);
};

const resolveAssetPath = (path: string, articleAssetPath: string) => {
  if (checkPrefix(path)) {
    return correntDuplicatePaths(`/${articleAssetPath}/${path.substr(prefix.length)}`);
  }
  return path;
};

const elementRewriters = new Map<string, (elm: Element, assetDir: string) => void>([
  [
    'img',
    (elm, assetDir) => {
      const imgElm = elm as ImgElement;
      imgElm.props.src = resolveAssetPath(imgElm.props.src, assetDir);
    },
  ],
  [
    'a',
    (elm, assetDir) => {
      const aElm = elm as AElement;
      aElm.props.href = resolveAssetPath(aElm.props.href, assetDir);
    },
  ],
]);

const ArticleAssetsResolverModule: Module<Options> = function (moduleOptions: Options) {
  this.nuxt.hook('content:file:beforeInsert', async (document, database) => {
    if (document.extension === '.md') {
      const bp = correntDuplicatePaths(`/${moduleOptions.articleRoot}/`);
      if (document.path.startsWith(bp)) {
        const commonPath = removeBaseDir(document.path, moduleOptions.articleRoot);
        const articleAssetsDir = correntDuplicatePaths(
          `/${moduleOptions.articleAssetsRoot}/${commonPath}`
        );
        const resolver = (nodes: Array<Element>) => {
          for (const node of nodes) {
            if (node.type === 'element') {
              if (node.tag !== undefined && elementRewriters.has(node.tag)) {
                elementRewriters.get(node.tag)!(node, articleAssetsDir);
              }
              if (node.children !== undefined) {
                resolver(node.children);
              }
            }
          }
        };
        resolver(document.body.children);
      }
    }
  });
};

export default ArticleAssetsResolverModule;
