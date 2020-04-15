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
        '@typescript-eslint/indent': 0,
        'comma-dangle': [
            2,
            {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'never',
            },
        ],
        '@typescript-eslint/space-before-function-paren': [
            2,
            {
                anonymous: 'never',
                named: 'never',
                asyncArrow: 'always',
            },
        ],

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

        // consistent code
        '@typescript-eslint/promise-function-async': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/return-await': [2, 'in-try-catch'],
        'require-await': 2,

        // naming conventions
        'new-cap': [2, { properties: false }],

        // code smells
        'sonarjs/cognitive-complexity': 1,
        'sonarjs/no-duplicate-string': 1,
        '@typescript-eslint/no-non-null-assertion': 1,
    },
};
