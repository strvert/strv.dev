const buildModules = [
  // https://go.nuxtjs.dev/typescript
  [
    '@nuxtjs/google-fonts',
    {
      families: {
        'M PLUS 1': [200, 300, 400, 600],
        'Source Code Pro': [300, 400],
      },
      display: 'swap',
    },
    '@nuxtjs/axios',
  ],
];

export default buildModules;
