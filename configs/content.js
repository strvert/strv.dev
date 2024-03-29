import remarkCodeExtraConfig from '../remarks/codeExtra';

const content = {
  markdown: {
    prism: {
      theme: 'prism-themes/themes/prism-one-light.css',
    },
    remarkPlugins: [
      'remark-math',
      ['remark-toc', {heading: "目次"}],
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
    rehypePlugins: ['rehype-katex'],
  },
};

export default content;
