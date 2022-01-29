import remarkCodeExtraConfig from '../remarks/codeExtra';

const content = {
  markdown: {
    prism: {
      theme: 'prism-themes/themes/prism-one-light.css',
    },
    remarkPlugins: [
      'remark-directive',
      [
        'remark-directive-webcomponents',
        [['blueprint-renderer', { class: 'blueprint-renderer', 'scroll-disabled': true }]],
      ],
      'remark-video',
      'remark-article-assets-path',
      ['remark-code-extra', remarkCodeExtraConfig],
      'remark-prism',
    ],
    rehypePlugins: [],
  },
};

export default content;
