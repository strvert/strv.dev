import remarkCodeExtraConfig from '../remarks/codeExtra';

const content = {
  markdown: {
    prism: {
      theme: 'prism-themes/themes/prism-one-light.css',
    },
    remarkPlugins: [['remark-code-extra', remarkCodeExtraConfig], 'remark-prism'],
    rehypePlugins: [],
  },
};

export default content;
