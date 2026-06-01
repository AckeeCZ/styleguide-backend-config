export = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'sonarjs'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:sonarjs/recommended-legacy',
    'plugin:security/recommended-legacy',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: [],
  rules: {
    'security/detect-object-injection': 0,
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      {
        allowNumber: true,
        allowBoolean: false,
        allowNullish: false,
      },
    ],
    '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
    'no-void': ['error', { allowAsStatement: true }],
    'no-fallthrough': 'warn',
    'no-constant-condition': ['warn', { checkLoops: false }],

    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    // consistent code
    'no-extra-semi': 0,
    '@typescript-eslint/promise-function-async': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/return-await': ['error', 'in-try-catch'],
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksConditionals: true,
        checksVoidReturn: {
          arguments: false,
          attributes: true,
          properties: true,
          returns: false,
          variables: true,
        },
        checksSpreads: true,
      },
    ],
    // naming conventions
    'new-cap': 0,
    'sonarjs/class-name': 0,
    'sonarjs/new-cap': 0,

    // code smells
    'sonarjs/assertions-in-tests': 0,
    'sonarjs/todo-tag': 0,
    'sonarjs/no-base-to-string': 0,
    'sonarjs/pseudo-random': 0,
    'sonarjs/no-os-command-from-path': 0,
    'sonarjs/no-misused-promises': 0,
    'sonarjs/redundant-type-aliases': 0,
    'sonarjs/sonar-no-unused-vars': 0,
    'sonarjs/slow-regex': 0,
    'security/detect-non-literal-fs-filename': 0,
    'sonarjs/cognitive-complexity': 'warn',
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/no-identical-functions': 'warn',
    'sonarjs/no-unused-collection': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-use-before-define': 'warn',
    '@typescript-eslint/no-var-requires': 'warn',
    '@typescript-eslint/require-array-sort-compare': 'warn',
    'no-async-promise-executor': 'warn',

    // Deduplicate overlapping rules
    'sonarjs/unused-import': 0, // -> @typescript-eslint/no-unused-vars
    'sonarjs/no-var': 0, // -> no-var
    'sonarjs/use-isnan': 0, // -> use-isnan
    'sonarjs/prefer-spread': 0, // -> prefer-spread
    'sonarjs/no-unused-expressions': 0, // -> @typescript-eslint/no-unused-expressions
    'sonarjs/prefer-namespace-keyword': 0, // -> @typescript-eslint/prefer-namespace-keyword
    'sonarjs/prefer-nullish-coalescing': 0, // -> @typescript-eslint/prefer-nullish-coalescing
    'sonarjs/sonar-no-fallthrough': 0, // -> no-fallthrough
    'sonarjs/sonar-no-control-regex': 0, // -> no-control-regex
    'sonarjs/sonar-no-empty-character-class': 0, // -> no-empty-character-class
    'sonarjs/sonar-no-invalid-regexp': 0, // -> no-invalid-regexp
    'sonarjs/sonar-no-misleading-character-class': 0, // -> no-misleading-character-class
    'sonarjs/sonar-no-regex-spaces': 0, // -> no-regex-spaces
  },
  settings: {
    node: {
      tryExtensions: ['.ts', '.js', '.json', '.node'],
      resolvePaths: [__dirname],
    },
  },
}
