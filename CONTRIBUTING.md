# Contributing

🎉 Thank you for wishing to collaborate to the wretch library!

**Ideas, feedback and help are more than welcome.**

## How to

### 1 - Clone the project

```bash
git clone https://github.com/elbywan/wretch
cd wretch
```

### 2 - Install dependencies

```bash
npm install
```

### 3 - Change the code as you see fit

### 4 - Lint, Build and Test

```bash
npm start
# To run browser specs
npm run test:browsers:local
```

The code **must** pass the linter and specs.

If you add a new functionality, please write some tests!

If a linter rule which is not already set in the tslint.json file is bothering you, feel free to propose a change.

### 5 - Commit & Pull request

If the modification is related to an existing issue, please mention the number in the commit message. (for instance: `closes #10`)

Also in order to generate a nice changelog file, please begin your commit message with an emoji corresponding to the change:

- :fire: `:fire:` -> breaking change
- :bug: `:bug:` -> bug fix
- :factory: `:factory:` -> new feature
- :art: `:art:` -> code improvement
- :checkered_flag: `:checkered_flag:` -> performance update
- :white_check_mark: `:white_check_mark:` -> test improvement
- :memo: `:memo:` -> documentation update
- :arrow_up: `:arrow_up:` -> package update

Furthermore, starting the actual message content with an upper case and using the present tense and imperative mood would be great.

And last but not least, always rebase your branch on top of the origin/master branch!
