const visit = require('unist-util-visit');
const h = require('hastscript');

const getDefaultAttrs = (tagName, options) => {
  const attr = options.find((opt) => opt[0] === tagName);
  return attr === undefined ? undefined : attr.length === 2 ? attr[1] : {};
};

const directiveWebcomponents = (options) => {
  return (tree) => {
    visit(tree, ['containerDirective'], (node) => {
      const attrs = getDefaultAttrs(node.name, options);
      if (attrs !== undefined) {
        const data = node.data || (node.data = {});
        const hast = h(node.name, node.attributes);

        if (hast) data.hName = hast.tagName;
        data.hProperties = { ...attrs, ...hast.properties };
      }
    });
  };
};

module.exports = directiveWebcomponents;
