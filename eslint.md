# ESLint

## Rules

We extend `eslint`/`typescript` recommended, `standard-with-typescript` and `plugin:sonarjs/recommended`. The following section describes further changes and reasoning behind them.

### Code formatting

#### Disabled `@typescript-eslint/indent`

There are inconsistencies in TS code between prettier and ESLint with TS parser (type ternary, template literals). Prettier is usually correct, we leave it to prettier and disable rule to avoid conflicts.

#### Modified `comma-dangle`

We enforce dangling commas for cleaner diffs, following the Airbnb standard.

#### Modified `@typescript-eslint/space-before-function-paren`

There is never a space seperating function name from the opening bracket and also no space after `function` keyword which stands as the function name. There is a space before `async`, since it is not a name but "modifier".

#### Disabled `@typescript-eslint/no-extra-semi`

We leave that settings on prettier. Basically we want to achieve [`semi: "never", { "beforeStatementContinuationChars": "always" }`](https://eslint.org/docs/rules/semi#beforestatementcontinuationchars), but that does not seem to work with TS.

1. Inconsistent with prettier and not configurable on prettier side.
2. Prevents funny diffs as explained [here](https://github.com/prettier/prettier/issues/736#issuecomment-291934981)

#### Disabled `@typescript-eslint/member-delimiter-style`

Prettier config changed via `semi` and member delimiter [is not](https://github.com/prettier/prettier/issues/1944#issuecomment-334112532) further configurable. Configuration is not trivial (single/multi line, type/interface, last line handling). For simplicity we leave that to prettier all together.

### Error prevention

#### Disabled `@typescript-eslint/strict-boolean-expressions`

Checking `null` or `undefined` explicitly for things that even cannot be falsely is a drag. We might consider tweaking via options to prevent errors with falsely values, disabling for now.

#### Disabled `@typescript-eslint/no-explicit-any`

Any is sometimes extremely convenient for prototyping or working with untyped package or migrating codebase. For some advanced typing, any casts are even necessary for TS implementation.

#### Modified `@typescript-eslint/restrict-template-expressions`

While most of the types are unsafe to use in string (resulting in unexpected `undefined` etc.), working with numbers in string concatenation is natural is dynamic languages. We allow that.

#### Modified `@typescript-eslint/no-floating-promises`

We allow void assignment as top level await alternative.

#### Modified `no-void`

Allow void statement for `@typescript-eslint/no-floating-promises` modification. Requires ESLint 7.

### Consistent code

#### Disabled `@typescript-eslint/promise-function-async`

There is no good reason to throw `async` around your code if you do not need await. Promises are beautiful on their.

#### Disabled `@typescript-eslint/explicit-function-return-type`

While it (probably) makes the code more robust, it makes it extremely verbose and encourages to create interface or named typed for every fart of code in your application. Prefer type inference when possible for minimal conscious code.

#### Modified `@typescript-eslint/return-await`

There is (almost) no use for awaiting returned value, except for in try block, where you want to handle rejected state. We allow only in try block. Allowing or even requiring it everywhere results in people throwing async everywhere and we don't want that.

#### Added `require-await`

There is (almost) no reason to use `async` when there is no `await`.

### Naming conventions

#### Modified `new-cap`

Constructors should be pascal case. We get in trouble when using third-party code or with dynamic classes. For that case we allow new on lowercase, when constructor is as nested property which is usually the case.

### Code smells

Reduced severity to warning for the following rules: `sonarjs/cognitive-complexity`, `sonarjs/no-duplicate-string`, `@typescript-eslint/no-non-null-assertion`.

Reduced severity to warning for `@typescript-eslint/no-use-before-define`, because while this recommendation generally makes sense, most of critical issues are reported by TS compiler. The reports on usage in types themselves are usually not impactful.

### Compatibility fixes

#### Disabled `@typescript-eslint/camelcase`

The deprecated rule has been removed and we are waiting for an update from `standard-with-typescript`.
