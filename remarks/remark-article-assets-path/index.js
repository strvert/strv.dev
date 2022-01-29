const visit = require('unist-util-visit');
const h = require('hastscript');

const correntDuplicatePaths = (path) => {
  while (path.includes('//')) {
    path = path.replace('//', '/');
  }
  return path;
};

const printNodes = (tree, depth = 0) => {
  const hypens = '-'.repeat(depth + 1);
  console.log(`${hypens} ${tree.type}`);
  if (tree.children === undefined) {
    return;
  }
  for (child of tree.children) {
    printNodes(child, depth + 1);
  }
};

const directiveArticleAssetsPath = (options) => {
  return (tree, vfile) => {
    if (vfile.data.assets === undefined) {
      return;
    }
    visit(tree, ['image', 'link', 'video', 'leafDirective'], (node) => {
      const is_leaf = node.type === 'leafDirective';
      const src = is_leaf ? node.attributes.src : node.url;
      if (src.startsWith('#/')) {
        if (is_leaf) {
          const data = node.data || (node.data = {});
          data.hProperties.src = `${vfile.data.assets}/${src.substr(1)}`;
        } else {
          node.url = `${vfile.data.assets}/${src.substr(1)}`;
        }
      }
    });
  };
};

module.exports = directiveArticleAssetsPath;
