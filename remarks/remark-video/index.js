const visit = require('unist-util-visit');
const h = require('hastscript');

const videoElement = (options) => {
  return (tree, vfile) => {
    if (vfile.data.assets === undefined) {
      return;
    }
    visit(tree, ['leafDirective'], (node) => {
      if (node.name === 'v' || node.name === 'vl') {
        const data = node.data || (node.data = {});
        const hast = h(node.name, node.attributes);
        if (hast) data.hName = 'video';
        if (node.name === 'v') {
          data.hProperties = {
            ...node.attributes,
            controls: true,
          };
        }
        if (node.name === 'vl') {
          data.hProperties = {
            ...node.attributes,
            autoplay: true,
            muted: true,
            loop: true,
          };
        }
      }
    });
  };
};

module.exports = videoElement;
