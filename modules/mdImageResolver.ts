import { Module } from '#app';

interface Options {
  articleRoot: string;
  articleImgRoot: string;
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

const correntDuplicatePaths = (path: string) => {
  while (path.includes('//')) {
    path = path.replace('//', '/');
  }
  return path;
};

const removeBaseDir = (articlePath: string, basePath: string) => {
  const bp = `/${basePath}/`;
  if (articlePath.slice(0, bp.length) === bp) {
    return articlePath.substr(bp.length);
  } else {
    throw new Error('不正なパスに配置された記事が読み込まれました');
  }
};

const MdImageResolverModule: Module<Options> = function (moduleOptions: Options) {
  this.nuxt.hook('content:file:beforeInsert', async (document, database) => {
    if (document.extension === '.md') {
      const commonPath = removeBaseDir(document.path, moduleOptions.articleRoot);
      const articleImgDir = correntDuplicatePaths(`/${moduleOptions.articleImgRoot}/${commonPath}`);
      const resolver = (nodes: Array<Element>) => {
        for (const node of nodes) {
          if (node.type === 'element') {
            if (node.tag !== undefined && node.tag === 'img') {
              const imgNode = node as ImgElement;
              const imgPath = correntDuplicatePaths(`${articleImgDir}/${imgNode.props.src}`);
              imgNode.props.src = imgPath;
              imgNode.props.alt = imgPath;
            }
            if (node.children !== undefined) {
              resolver(node.children);
            }
          }
        }
      };
      resolver(document.body.children);
    }
  });
};

export default MdImageResolverModule;
