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

Reduced severity to warning for the following rules: `sonarjs/cognitive-complexity`, `sonarjs/no-duplicate-string`, `@typescript-eslint/no-non-null-assertion`

