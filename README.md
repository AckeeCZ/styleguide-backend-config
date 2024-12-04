<div align="center">

![](logo.png)

# Ackee styleguide: Backend config

Configuration files for [styleguide](https://github.com/AckeeCZ/styleguide) enforcement tools

</div>

## Setup

```
npm i -D @ackee/styleguide-backend-config
```

## ESLint

`.eslintrc.js` or `.eslintrc.cjs` for ESM projects

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

For detailed rules description, see [eslint](eslint.md)

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
