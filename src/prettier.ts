export = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  arrowParens: 'avoid',
  overrides: [
    {
      files: ['**/*.jsonc'],
      options: {
        trailingComma: 'none',
      },
    },
  ],
}
