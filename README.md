<div align="center">

# Ackee styleguide: Backend config

Configuration files for [styleguide](https://github.com/AckeeCZ/styleguide) enforcement tools

[![](https://img.shields.io/travis/com/AckeeCZ/styleguide-backend-config?style=flat-square)](https://github.com/AckeeCZ/styleguide-backend-config)
[![](https://img.shields.io/npm/v/@ackee/styleguide-backend-config?style=flat-square)](https://www.npmjs.com/package/@ackee/styleguide-backend-config)

</div>

## Setup

```
npm i -D @ackee/styleguide-backend-config
```

## ESLint

`.eslintrc.js`

```js
module.exports = require('@ackee/styleguide-backend-config/eslint')
```

```jsonc
{
  // npm tasks
  "cs:eslint:check": "eslint --ignore-path .gitignore '**/*.ts' -f codeframe",
  "cs:eslint:fix": "npm run cs:eslint:check -- --fix"
}
```

For detailed rules description, see [eslint](./eslint.md)

## Prettier

`npm install -D prettier`

`prettier.config.js`

```js
module.exports = require('@ackee/styleguide-backend-config/prettier')
```

```jsonc
{
  // npm tasks
  "cs:prettier:check": "prettier --ignore-path .gitignore --check '**/*.{ts,js,json,md}'",
  "cs:prettier:fix": "npm run cs:prettier:check -- --write '**/*.{ts,js,json,md}'"
}
```

## Editorconfig

`npm install -D eclint`

Copy `.editorconfig` from this project

```jsonc
{
  // npm tasks
  "cs:eclint:check": "eclint check '**/*'",
  "cs:eclint:fix": "eclint fix '**/*'"
}
```

## Husky

`.huskyrc.json`

```json
{
  "hooks": {
    "pre-commit": "lint-staged",
    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
  }
}
```

`.lintstagedrc`

```json
{
  "*.ts": ["prettier --write", "eslint --fix"],
  "*.{ts,js,json,md}": "prettier --write",
  "*": ["eclint fix", "eclint check"]
}
```

## Danger

`dangerfile.ts`

```typescript
import {
  danger,
  warn,
  message,
  fail,
  markdown,
  schedule,
  peril,
  results,
} from 'danger'
import { runDangerRules } from '@ackee/styleguide-backend-config/danger'

void runDangerRules(
  { danger, warn, message, fail, markdown, schedule, peril, results },
  {
    /* pass options */
  }
)
```

## License

This project is licensed under [MIT](./LICENSE).
