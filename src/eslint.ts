export = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'sonarjs'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'standard-with-typescript',
    'plugin:sonarjs/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: [],
  rules: {
    // code formatting
    '@typescript-eslint/comma-dangle': [
      'error',
      {
        arrays: 'only-multiline',
        objects: 'only-multiline',
        imports: 'only-multiline',
        exports: 'only-multiline',
        functions: 'never',
        enums: 'only-multiline',
        generics: 'only-multiline',
        tuples: 'only-multiline',
      },
    ],
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/space-before-function-paren': [
      2,
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    '@typescript-eslint/no-extra-semi': 0,
    '@typescript-eslint/member-delimiter-style': 0,

    // error prevention
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/restrict-template-expressions': [
      2,
      {
        allowNumber: true,
        allowBoolean: false,
        allowNullable: false,
      },
    ],
    '@typescript-eslint/no-floating-promises': [2, { ignoreVoid: true }],
    'no-void': [2, { allowAsStatement: true }],

    // Less strictness over ??
    '@typescript-eslint/prefer-nullish-coalescing': 1,
    // consistent code
    '@typescript-eslint/promise-function-async': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/return-await': [2, 'in-try-catch'],

    // naming conventions
    'new-cap': [2, { properties: false }],

    // code smells
    'sonarjs/cognitive-complexity': 1,
    'sonarjs/no-duplicate-string': 1,
    '@typescript-eslint/no-non-null-assertion': 1,
    '@typescript-eslint/no-use-before-define': 1,
    'sonarjs/no-identical-functions': 1,
  },
  settings: {
    node: {
      tryExtensions: ['.ts', '.js', '.json', '.node'],
      resolvePaths: [__dirname],
    },
  },
}
