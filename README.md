<div align="center">

![](logo.png)

# Ackee styleguide: Backend config

Configuration files for [styleguide](https://github.com/AckeeCZ/styleguide) enforcement tools

[![](https://img.shields.io/travis/com/AckeeCZ/styleguide-backend-config?style=flat-square)](https://travis-ci.com/github/AckeeCZ/styleguide-backend-config)
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
  "eslint:check": "eslint --ignore-path .gitignore '**/*.ts' -f codeframe",
  "eslint:fix": "npm run eslint:check -- --fix",
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
  "prettier:check": "prettier --ignore-path .gitignore --check '**/*.{ts,js,json,md}'",
  "prettier:fix": "npm run prettier:check -- --write '**/*.{ts,js,json,md}'",
}
```

## Husky

`.husky\pre-commit`

```sh
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

`.lintstagedrc`

```json
{
  "*.ts": ["prettier --write", "eslint --fix"],
  "*.{ts,js,json,md}": "prettier --write"
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
