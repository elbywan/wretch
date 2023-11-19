## <small>2.7.1 (2023-11-19)</small>

* :arrow_up: Bump @babel/traverse from 7.19.4 to 7.23.2 ([922005e](https://github.com/elbywan/wretch/commit/922005e))
* :arrow_up: Upgrade dependencies ([d774826](https://github.com/elbywan/wretch/commit/d774826))
* :bug: Fix passing Headers/entries array as an argument to headers() ([f32845a](https://github.com/elbywan/wretch/commit/f32845a)), closes [#205](https://github.com/elbywan/wretch/issues/205)



## 2.7.0 (2023-09-12)

* :factory: Support FileList objects in the form data addon ([3582809](https://github.com/elbywan/wretch/commit/3582809)), closes [#201](https://github.com/elbywan/wretch/issues/201)
* :memo: Mention file names in the form data addon doc ([411fb09](https://github.com/elbywan/wretch/commit/411fb09)), closes [#197](https://github.com/elbywan/wretch/issues/197)
* 2.7.0 tag ([a804cac](https://github.com/elbywan/wretch/commit/a804cac))
* Revert changelog version ([f445703](https://github.com/elbywan/wretch/commit/f445703))



## 2.6.0 (2023-06-28)

* :arrow_up: Bump engine.io and socket.io ([3ef1738](https://github.com/elbywan/wretch/commit/3ef1738))
* :arrow_up: Bump socket.io-parser from 4.2.2 to 4.2.3 ([b42aa0f](https://github.com/elbywan/wretch/commit/b42aa0f))
* :arrow_up: Upgrade dependencies ([b183cf7](https://github.com/elbywan/wretch/commit/b183cf7))
* :factory: Add fallback catcher method ([46610cf](https://github.com/elbywan/wretch/commit/46610cf)), closes [#192](https://github.com/elbywan/wretch/issues/192)
* :memo: Update node-fetch code snippet ([3b6ac7e](https://github.com/elbywan/wretch/commit/3b6ac7e)), closes [#179](https://github.com/elbywan/wretch/issues/179)
* 2.6.0 tag ([6647f35](https://github.com/elbywan/wretch/commit/6647f35))
* Fix .addons typo in README ([e646004](https://github.com/elbywan/wretch/commit/e646004))
* docs: fix example import in README.md ([20f66a5](https://github.com/elbywan/wretch/commit/20f66a5))
* fix(docs): miss braces ([9e65465](https://github.com/elbywan/wretch/commit/9e65465))



## <small>2.5.2 (2023-04-11)</small>

* :bug: Fix catcher and resolve callback argument type. ([76c295f](https://github.com/elbywan/wretch/commit/76c295f)), closes [#177](https://github.com/elbywan/wretch/issues/177)
* :memo: Node.js 18 section wording ([b696b1c](https://github.com/elbywan/wretch/commit/b696b1c))
* :memo: Warn to use a custom until function to avoid retrying on 4xx errors ([1812c73](https://github.com/elbywan/wretch/commit/1812c73)), closes [#176](https://github.com/elbywan/wretch/issues/176)
* 2.5.2 tag ([bda300c](https://github.com/elbywan/wretch/commit/bda300c))



## <small>2.5.1 (2023-02-27)</small>

* :bug: Update resolver.ts - Add null verification to .get("Content-Type") ([a68a524](https://github.com/elbywan/wretch/commit/a68a524))
* 2.5.1 tag ([77c0a1d](https://github.com/elbywan/wretch/commit/77c0a1d))



## 2.5.0 (2023-02-20)

* :arrow_up: Bump @fastify/multipart from 7.3.0 to 7.4.1 ([e6074c9](https://github.com/elbywan/wretch/commit/e6074c9))
* :arrow_up: Bump @sideway/formula from 3.0.0 to 3.0.1 ([8208646](https://github.com/elbywan/wretch/commit/8208646))
* :arrow_up: Bump ua-parser-js from 0.7.31 to 0.7.33 ([1694fe6](https://github.com/elbywan/wretch/commit/1694fe6))
* :factory: Parse error type as json on proper content-type ([ea9adbf](https://github.com/elbywan/wretch/commit/ea9adbf)), closes [#171](https://github.com/elbywan/wretch/issues/171)
* 2.5.0 tag ([a3bec71](https://github.com/elbywan/wretch/commit/a3bec71))



## <small>2.4.1 (2023-01-20)</small>

* :bug: Fix abort/progress addons state isolation issue ([2b3a659](https://github.com/elbywan/wretch/commit/2b3a659))
* 2.4.1 tag ([f585b22](https://github.com/elbywan/wretch/commit/f585b22))



## 2.4.0 (2023-01-19)

* :factory: Add skip argument to the retry middleware ([746f8c9](https://github.com/elbywan/wretch/commit/746f8c9))
* 2.4.0 tag ([bd3575a](https://github.com/elbywan/wretch/commit/bd3575a))



## <small>2.3.2 (2023-01-11)</small>

* :bug: Fix catcher priority ([d359bd7](https://github.com/elbywan/wretch/commit/d359bd7)), closes [#162](https://github.com/elbywan/wretch/issues/162)
* 2.3.2 tag ([d251fb1](https://github.com/elbywan/wretch/commit/d251fb1))
* Fix typo in throttling.spec.ts ([9fc3e68](https://github.com/elbywan/wretch/commit/9fc3e68))



## <small>2.3.1 (2023-01-07)</small>

* :bug: Fix middlewares and addons subpath exports ([bfd2542](https://github.com/elbywan/wretch/commit/bfd2542)), closes [#160](https://github.com/elbywan/wretch/issues/160)
* :memo: Add limitations section to the readme ([ad0a102](https://github.com/elbywan/wretch/commit/ad0a102)), closes [#159](https://github.com/elbywan/wretch/issues/159)
* 2.3.1 tag ([5098dea](https://github.com/elbywan/wretch/commit/5098dea))



## 2.3.0 (2022-12-12)

* :factory: Add url property to WretchError ([a1f6ac6](https://github.com/elbywan/wretch/commit/a1f6ac6)), closes [#157](https://github.com/elbywan/wretch/issues/157)
* 2.3.0 tag ([c1fc7a6](https://github.com/elbywan/wretch/commit/c1fc7a6))



## <small>2.2.3 (2022-12-09)</small>

* :bug: Better error catching precedence ([107fc71](https://github.com/elbywan/wretch/commit/107fc71)), closes [#155](https://github.com/elbywan/wretch/issues/155)
* 2.2.3 tag ([d18ef68](https://github.com/elbywan/wretch/commit/d18ef68))



## <small>2.2.2 (2022-12-03)</small>

* :bug: Fix compatibility issue between the perfs and progress addons ([b70e8cd](https://github.com/elbywan/wretch/commit/b70e8cd))
* 2.2.2 tag ([3ffd0d3](https://github.com/elbywan/wretch/commit/3ffd0d3))
* Fix readme typo ([39a37d1](https://github.com/elbywan/wretch/commit/39a37d1))



## <small>2.2.1 (2022-12-03)</small>

* :bug: Add missing export for the progress addon ([ebb0577](https://github.com/elbywan/wretch/commit/ebb0577))
* :bug: Add missing progress addon rollup config ([bd6c89b](https://github.com/elbywan/wretch/commit/bd6c89b))
* :bug: Register the progress addon in the .all entry point ([b01e03d](https://github.com/elbywan/wretch/commit/b01e03d))
* 2.2.1 tag ([34b1594](https://github.com/elbywan/wretch/commit/34b1594))
* Readme typo ([941efd5](https://github.com/elbywan/wretch/commit/941efd5))



## 2.2.0 (2022-12-03)

* :arrow_up: Bump dependencies including outdated rollup plugins ([bcbcdc5](https://github.com/elbywan/wretch/commit/bcbcdc5))
* :arrow_up: Bump engine.io from 6.2.0 to 6.2.1 ([6a93854](https://github.com/elbywan/wretch/commit/6a93854))
* :arrow_up: Bump fastify from 4.9.2 to 4.10.2 ([8ae9122](https://github.com/elbywan/wretch/commit/8ae9122))
* :art: Add a prepare script ([17b0a76](https://github.com/elbywan/wretch/commit/17b0a76))
* :bug: Fix a minor Wretch type issue in addons ([23ba7b1](https://github.com/elbywan/wretch/commit/23ba7b1))
* :factory: Add progress addon ([2bae524](https://github.com/elbywan/wretch/commit/2bae524)), closes [#154](https://github.com/elbywan/wretch/issues/154)
* ⬆️ Upgrade actions/checkout to v3 ([a6a6502](https://github.com/elbywan/wretch/commit/a6a6502))
* 2.2.0 tag ([9ab4c60](https://github.com/elbywan/wretch/commit/9ab4c60))



## <small>2.1.5 (2022-10-15)</small>

* :arrow_up: Bump dependencies ([6043c75](https://github.com/elbywan/wretch/commit/6043c75))
* :arrow_up: Bump fastify from 4.3.0 to 4.8.1 ([130ccc2](https://github.com/elbywan/wretch/commit/130ccc2))
* :bug: Query addon should strip undefined values ([ce395b5](https://github.com/elbywan/wretch/commit/ce395b5)), closes [#148](https://github.com/elbywan/wretch/issues/148)
* :memo: Add timeout code sample in the readme ([beb51c8](https://github.com/elbywan/wretch/commit/beb51c8))
* :memo: Fix outdated code comments ([d4c546d](https://github.com/elbywan/wretch/commit/d4c546d))
* :memo: Fix unpkg url  in the readme ([07d4a00](https://github.com/elbywan/wretch/commit/07d4a00))
* 2.1.5 tag ([5505c8b](https://github.com/elbywan/wretch/commit/5505c8b))



## <small>2.1.4 (2022-09-28)</small>

* :bug: Relax the typechecker when using resolve within defer ([9e052c8](https://github.com/elbywan/wretch/commit/9e052c8)), closes [#146](https://github.com/elbywan/wretch/issues/146)
* 2.1.4 tag ([0e07574](https://github.com/elbywan/wretch/commit/0e07574))



## <small>2.1.3 (2022-09-28)</small>

* :bug: Fix the retry middleware crashing on network errors ([95cbad5](https://github.com/elbywan/wretch/commit/95cbad5)), closes [#145](https://github.com/elbywan/wretch/issues/145)
* 2.1.3 tag ([06f9b7a](https://github.com/elbywan/wretch/commit/06f9b7a))



## <small>2.1.2 (2022-09-27)</small>

* :art: Fix some linter warnings ([c1029c8](https://github.com/elbywan/wretch/commit/c1029c8))
* :bug: Fix type inconsistencies in the body parsers ([b7cae7e](https://github.com/elbywan/wretch/commit/b7cae7e)), closes [#143](https://github.com/elbywan/wretch/issues/143)
* :memo: Fix throttling cache documentation link ([f66859d](https://github.com/elbywan/wretch/commit/f66859d))
* 2.1.2 tag ([a2b3a37](https://github.com/elbywan/wretch/commit/a2b3a37))



## <small>2.1.1 (2022-09-03)</small>

* :bug: Fix typo in function name #141 ([d82cfd5](https://github.com/elbywan/wretch/commit/d82cfd5)), closes [#141](https://github.com/elbywan/wretch/issues/141)
* 2.1.1 tag ([5520b06](https://github.com/elbywan/wretch/commit/5520b06))



## 2.1.0 (2022-09-03)

* :factory: Add ability to resolve with latest response to the retry middleware. #141 ([60a7453](https://github.com/elbywan/wretch/commit/60a7453)), closes [#141](https://github.com/elbywan/wretch/issues/141)
* :memo: Remove outdated documentation entries for the retry middleware ([7a5620c](https://github.com/elbywan/wretch/commit/7a5620c))
* 2.1.0 tag ([7c5b224](https://github.com/elbywan/wretch/commit/7c5b224))



## <small>2.0.4 (2022-08-18)</small>

* :art: Harmonize WretchError types ([1981837](https://github.com/elbywan/wretch/commit/1981837))
* 2.0.4 tag ([5d33256](https://github.com/elbywan/wretch/commit/5d33256))



## <small>2.0.3 (2022-08-16)</small>

* :art: Export WretchError from the root index ([76f9096](https://github.com/elbywan/wretch/commit/76f9096)), closes [#79](https://github.com/elbywan/wretch/issues/79)
* 2.0.3 tag ([30e6b98](https://github.com/elbywan/wretch/commit/30e6b98))



## <small>2.0.2 (2022-08-03)</small>

* :bug: Fix defer and resolve return types. ([0c59c6c](https://github.com/elbywan/wretch/commit/0c59c6c)), closes [#140](https://github.com/elbywan/wretch/issues/140)
* 2.0.2 tag ([e55fa04](https://github.com/elbywan/wretch/commit/e55fa04))



## <small>2.0.1 (2022-08-02)</small>

* :arrow_up: Add unpkg field to map to the right bundle. ([ae87b64](https://github.com/elbywan/wretch/commit/ae87b64))
* :arrow_up: Upgrade dependencies. ([b6a1258](https://github.com/elbywan/wretch/commit/b6a1258))
* :memo: Update cdn links. ([7571101](https://github.com/elbywan/wretch/commit/7571101))
* 2.0.1 tag ([4c4838d](https://github.com/elbywan/wretch/commit/4c4838d))
* Add addons ts video to the readme ([44f3083](https://github.com/elbywan/wretch/commit/44f3083))
* Improve the chaining part of the readme ([adea0fe](https://github.com/elbywan/wretch/commit/adea0fe))
* increase mock:wait timeout to 10s ([5be1ad8](https://github.com/elbywan/wretch/commit/5be1ad8))
* Update bundle size ([a43a6ab](https://github.com/elbywan/wretch/commit/a43a6ab))
* Update cdn links in readme ([1b6e8d5](https://github.com/elbywan/wretch/commit/1b6e8d5))
* Update estimated gzip size in readme ([94ebf81](https://github.com/elbywan/wretch/commit/94ebf81))
* Update github actions badge ([51f3846](https://github.com/elbywan/wretch/commit/51f3846))
* Update migration guide ([cfa9eb6](https://github.com/elbywan/wretch/commit/cfa9eb6))
* Update migration guide ([d3bff85](https://github.com/elbywan/wretch/commit/d3bff85))



## 2.0.0 (2022-08-01)

* 2.0 tag ([baaddaa](https://github.com/elbywan/wretch/commit/baaddaa))
* Add minimal example to the readme ([9c7e0ed](https://github.com/elbywan/wretch/commit/9c7e0ed))
* Better webpack subpath exports compatibility ([cc1164c](https://github.com/elbywan/wretch/commit/cc1164c))
* Fix readme minor typos ([bce61cc](https://github.com/elbywan/wretch/commit/bce61cc))
* Fix typings when programming actions using the defer/resolver methods ([285456d](https://github.com/elbywan/wretch/commit/285456d))
* Minor website tweaks ([c7fb571](https://github.com/elbywan/wretch/commit/c7fb571))
* Update readme ([9e666ae](https://github.com/elbywan/wretch/commit/9e666ae))
* Upgrade dependencies ([6a69b8f](https://github.com/elbywan/wretch/commit/6a69b8f))
* Use unknown type for json body handler ([aec7590](https://github.com/elbywan/wretch/commit/aec7590))
* Readme: wording ([ad88324](https://github.com/elbywan/wretch/commit/ad88324))



## 2.0.0-next.1 (2022-07-08)

* :art: Add editorconfig ([e81eaff](https://github.com/elbywan/wretch/commit/e81eaff))
* :fire: Drop support on node < 14 ([1ff926c](https://github.com/elbywan/wretch/commit/1ff926c))
* :memo: Additional improvements ([e79ff71](https://github.com/elbywan/wretch/commit/e79ff71))
* :memo: Autogenerate API documentation and split it from the main README ([c710a71](https://github.com/elbywan/wretch/commit/c710a71))
* :memo: Move svg asset and minor readme changes ([30de07c](https://github.com/elbywan/wretch/commit/30de07c))
* :memo: Regenerate api doc ([7ae5b57](https://github.com/elbywan/wretch/commit/7ae5b57))
* :memo: Small edits to the contributing file and renames scripts related to browser specs ([abec7f0](https://github.com/elbywan/wretch/commit/abec7f0))
* :memo: Update bundle size ([1115d34](https://github.com/elbywan/wretch/commit/1115d34))
* :memo: Update companion website ([d6bb842](https://github.com/elbywan/wretch/commit/d6bb842))
* :memo: Update documentation ([15fd187](https://github.com/elbywan/wretch/commit/15fd187))
* :white_check_mark: Fix resolvers test for node14 ([ca8b559](https://github.com/elbywan/wretch/commit/ca8b559))
* :white_check_mark: Fix test on node 18 (with polyfilled fetch) ([d3b7b00](https://github.com/elbywan/wretch/commit/d3b7b00))
* :white_check_mark: Replace restify with fastify for mock server ([9ee2cfc](https://github.com/elbywan/wretch/commit/9ee2cfc))
* :white_check_mark: Run lint on CI ([9b819d3](https://github.com/elbywan/wretch/commit/9b819d3))
* :white_check_mark: Test in multiple version of node in CI ([00d80a6](https://github.com/elbywan/wretch/commit/00d80a6))
* ✅ Add deno specs and refactor types ([c873f02](https://github.com/elbywan/wretch/commit/c873f02))
* ✅ Use karma.js to run browser specs ([e41f142](https://github.com/elbywan/wretch/commit/e41f142))
* 🏭 Internalize the wretch-middlewares package ([a290f77](https://github.com/elbywan/wretch/commit/a290f77))
* 2.0.0-next.1 tag ([d867227](https://github.com/elbywan/wretch/commit/d867227))
* better emoji ([60d66fb](https://github.com/elbywan/wretch/commit/60d66fb))
* fix typos ([b696753](https://github.com/elbywan/wretch/commit/b696753))
* minor edits ([015781c](https://github.com/elbywan/wretch/commit/015781c))
* Run the CI when pushing on dev ([37b45ea](https://github.com/elbywan/wretch/commit/37b45ea))
* Update README.md ([21f3089](https://github.com/elbywan/wretch/commit/21f3089))



## 2.0.0-next.0 (2022-07-03)

* :arrow_up: Bump packages ([5302d04](https://github.com/elbywan/wretch/commit/5302d04))
* :art: Improved packaging and bundling ([69c1e35](https://github.com/elbywan/wretch/commit/69c1e35))
* :bug: Fix the jest resolver ([3a1f7b8](https://github.com/elbywan/wretch/commit/3a1f7b8))
* :docs: Update readme and website ([2eb24dc](https://github.com/elbywan/wretch/commit/2eb24dc))
* :factory: Add error cause ([9a0a387](https://github.com/elbywan/wretch/commit/9a0a387)), closes [#98](https://github.com/elbywan/wretch/issues/98)
* :factory: Mark errors with a custom class ([211c902](https://github.com/elbywan/wretch/commit/211c902)), closes [#79](https://github.com/elbywan/wretch/issues/79)
* :fire: Add url arg and harmonize replace/mixin arguments ([8e4d0aa](https://github.com/elbywan/wretch/commit/8e4d0aa))
* :fire: Complete refactoring ([c2f5035](https://github.com/elbywan/wretch/commit/c2f5035))
* :fire: Restore normal array behaviour for formdata and fix tests ([6879d48](https://github.com/elbywan/wretch/commit/6879d48)), closes [#119](https://github.com/elbywan/wretch/issues/119)
* :memo: Update browserstack badge. ([91cad34](https://github.com/elbywan/wretch/commit/91cad34))
* :white_check_mark: Better tests coverage ([77e85dc](https://github.com/elbywan/wretch/commit/77e85dc))
* 2.0.0-next.0 tag ([72e99f3](https://github.com/elbywan/wretch/commit/72e99f3))
* final fixes ([d2d3a36](https://github.com/elbywan/wretch/commit/d2d3a36))
* format tslint config file ([59e2e5d](https://github.com/elbywan/wretch/commit/59e2e5d))
* gitignore test build output ([564bce3](https://github.com/elbywan/wretch/commit/564bce3))
* golf bytes ([e4dd8aa](https://github.com/elbywan/wretch/commit/e4dd8aa))
* golf more bytes ([6902d99](https://github.com/elbywan/wretch/commit/6902d99))
* remove paypal funding ([95ad916](https://github.com/elbywan/wretch/commit/95ad916))


### BREAKING CHANGE

* - Does not append [] anymore when appending an array through the .formData helper.


## <small>1.7.10 (2022-05-21)</small>

* :arrow_up: Bump minimist from 1.2.5 to 1.2.6 ([6365ad0](https://github.com/elbywan/wretch/commit/6365ad0))
* :arrow_up: Bump moment from 2.24.0 to 2.29.2 ([26e3889](https://github.com/elbywan/wretch/commit/26e3889))
* :arrow_up: Bump to npm 8 ([9d5758e](https://github.com/elbywan/wretch/commit/9d5758e))
* :bug: Ignore when the .perf promise throws ([33407ea](https://github.com/elbywan/wretch/commit/33407ea)), closes [#131](https://github.com/elbywan/wretch/issues/131)
* :memo: Update performance api node.js polyfill. ([185420b](https://github.com/elbywan/wretch/commit/185420b))
* :white_check_mark: Migrate to github actions. ([4b93f43](https://github.com/elbywan/wretch/commit/4b93f43))
* 1.7.10 tag ([c4c2c70](https://github.com/elbywan/wretch/commit/c4c2c70))
* Add dummy action for testing purposes. ([38d5e0b](https://github.com/elbywan/wretch/commit/38d5e0b))



## <small>1.7.9 (2022-02-05)</small>

* :bug: Body json serialization condition fix. ([1c90fa3](https://github.com/elbywan/wretch/commit/1c90fa3)), closes [#123](https://github.com/elbywan/wretch/issues/123)
* 1.7.9 tag ([370fd00](https://github.com/elbywan/wretch/commit/370fd00))



## <small>1.7.8 (2022-01-30)</small>

* :arrow_up: Bump dependencies and npm audit. ([881d17a](https://github.com/elbywan/wretch/commit/881d17a))
* :bug: Fix error for opaque responses. ([bbb5912](https://github.com/elbywan/wretch/commit/bbb5912)), closes [#121](https://github.com/elbywan/wretch/issues/121)
* :bug: Preserve exotic json content types when strigifying body. ([d51c17b](https://github.com/elbywan/wretch/commit/d51c17b)), closes [#122](https://github.com/elbywan/wretch/issues/122)
* 1.7.8 tag ([5ec641e](https://github.com/elbywan/wretch/commit/5ec641e))



## <small>1.7.7 (2021-12-13)</small>

* :bug: Fix errorType argument type. ([5efd606](https://github.com/elbywan/wretch/commit/5efd606)), closes [#118](https://github.com/elbywan/wretch/issues/118)
* :memo: Update outdated badges. ([f286481](https://github.com/elbywan/wretch/commit/f286481))
* 1.7.7 tag ([41a0e3d](https://github.com/elbywan/wretch/commit/41a0e3d))



## <small>1.7.6 (2021-08-06)</small>

* :arrow_up: Upgrade dependencies. ([f62f977](https://github.com/elbywan/wretch/commit/f62f977))
* :bug: Prevent appending an extra ?/& for empty query strings. #114 ([15464a8](https://github.com/elbywan/wretch/commit/15464a8)), closes [#114](https://github.com/elbywan/wretch/issues/114)
* :memo: Update readme badges. ([b65878f](https://github.com/elbywan/wretch/commit/b65878f))
* 1.7.6 tag ([dcd114a](https://github.com/elbywan/wretch/commit/dcd114a))



## <small>1.7.5 (2021-06-30)</small>

* :arrow_up: Bump find-my-way from 2.2.1 to 2.2.5 ([687a999](https://github.com/elbywan/wretch/commit/687a999))
* :arrow_up: Bump handlebars from 4.7.6 to 4.7.7 ([0cb2ac2](https://github.com/elbywan/wretch/commit/0cb2ac2))
* :arrow_up: Bump hosted-git-info from 2.8.8 to 2.8.9 ([c862315](https://github.com/elbywan/wretch/commit/c862315))
* :arrow_up: Bump ini from 1.3.5 to 1.3.7 ([79fd31f](https://github.com/elbywan/wretch/commit/79fd31f))
* :arrow_up: Bump lodash from 4.17.19 to 4.17.21 ([fe66a14](https://github.com/elbywan/wretch/commit/fe66a14))
* :arrow_up: Bump node-notifier from 8.0.0 to 8.0.1 ([43cd685](https://github.com/elbywan/wretch/commit/43cd685))
* :arrow_up: Bump ws from 7.3.1 to 7.4.6 ([d0f89f1](https://github.com/elbywan/wretch/commit/d0f89f1))
* :arrow_up: Bump y18n from 4.0.0 to 4.0.1 ([6d0fbdc](https://github.com/elbywan/wretch/commit/6d0fbdc))
* :arrow_up: Upgrade dependencies. ([805fade](https://github.com/elbywan/wretch/commit/805fade))
* :bug: Take into account the options argument headers when stringifying body. #75 ([23484fd](https://github.com/elbywan/wretch/commit/23484fd)), closes [#75](https://github.com/elbywan/wretch/issues/75)
* :memo: Update readme import section ([5970e6d](https://github.com/elbywan/wretch/commit/5970e6d))
* 💸 Add FUNDING.yml ([4888bee](https://github.com/elbywan/wretch/commit/4888bee))
* 1.7.5 tag ([16d6619](https://github.com/elbywan/wretch/commit/16d6619))
* Gitignore /dist file. ([69800b4](https://github.com/elbywan/wretch/commit/69800b4))
* Remove /dist files from versioning. ([5cb651c](https://github.com/elbywan/wretch/commit/5cb651c))



## <small>1.7.4 (2020-10-14)</small>

* :bug: Fix post with overloaded json content-type charset. ([af48887](https://github.com/elbywan/wretch/commit/af48887))
* :memo:  Update package size approximation. ([2399419](https://github.com/elbywan/wretch/commit/2399419))
* 1.7.4 tag ([e61da95](https://github.com/elbywan/wretch/commit/e61da95))



## <small>1.7.3 (2020-10-12)</small>

* :arrow_up: Bump lodash from 4.17.14 to 4.17.19 ([c5c255f](https://github.com/elbywan/wretch/commit/c5c255f))
* :arrow_up: Bump node-fetch from 2.6.0 to 2.6.1 ([d536ba5](https://github.com/elbywan/wretch/commit/d536ba5))
* :arrow_up: Upgrade dependencies ([0bb3235](https://github.com/elbywan/wretch/commit/0bb3235))
* :bug: Allow custom charset with json body. ([52d2caa](https://github.com/elbywan/wretch/commit/52d2caa)), closes [#90](https://github.com/elbywan/wretch/issues/90)
* :memo: Fix readme arry typo. ([b465a4f](https://github.com/elbywan/wretch/commit/b465a4f))
* :memo: Fix readme bad chars. ([12b7231](https://github.com/elbywan/wretch/commit/12b7231))
* :memo: Mention Deno in the readme. ([b52847a](https://github.com/elbywan/wretch/commit/b52847a))
* 1.7.3 tag ([4dbc097](https://github.com/elbywan/wretch/commit/4dbc097))
* fix typo in readme ([294bdb3](https://github.com/elbywan/wretch/commit/294bdb3))
* docs: Fix simple typo, passsed -> passed ([f25394f](https://github.com/elbywan/wretch/commit/f25394f))



## <small>1.7.2 (2020-04-13)</small>

* :arrow_up: Bump acorn from 6.4.0 to 6.4.1 ([24bc906](https://github.com/elbywan/wretch/commit/24bc906))
* :arrow_up: Upgrade dependencies ([76b32fd](https://github.com/elbywan/wretch/commit/76b32fd))
* :bug: Prevent overriding content-type when passing body in http methods. #75 ([f6f9302](https://github.com/elbywan/wretch/commit/f6f9302)), closes [#75](https://github.com/elbywan/wretch/issues/75)
* 1.7.2 tag ([8c02bc5](https://github.com/elbywan/wretch/commit/8c02bc5))



## <small>1.7.1 (2020-01-25)</small>

* :bug: Fix crash on nested null formdata value. #68 ([9c1adf0](https://github.com/elbywan/wretch/commit/9c1adf0)), closes [#68](https://github.com/elbywan/wretch/issues/68)
* :memo: Update broken readme link. ([e115c63](https://github.com/elbywan/wretch/commit/e115c63))
* 1.7.1 tag ([bc99e50](https://github.com/elbywan/wretch/commit/bc99e50))



## 1.7.0 (2020-01-25)

* :arrow_up: Upgrade packages ([a68d94e](https://github.com/elbywan/wretch/commit/a68d94e))
* :factory: Support nested objects in formData. #68 ([90d9555](https://github.com/elbywan/wretch/commit/90d9555)), closes [#68](https://github.com/elbywan/wretch/issues/68)
* 1.7.0 tag ([74462ee](https://github.com/elbywan/wretch/commit/74462ee))



## 1.6.0 (2019-11-27)

* :factory: Add esm bundle. #63 ([9655b46](https://github.com/elbywan/wretch/commit/9655b46)), closes [#63](https://github.com/elbywan/wretch/issues/63)
* :factory: Add fetch error catcher. #62 ([96a147c](https://github.com/elbywan/wretch/commit/96a147c)), closes [#62](https://github.com/elbywan/wretch/issues/62)
* 1.6.0 tag ([a7940c8](https://github.com/elbywan/wretch/commit/a7940c8))



## <small>1.5.5 (2019-10-15)</small>

* :arrow_up: Upgrade packages ([05c0b9e](https://github.com/elbywan/wretch/commit/05c0b9e))
* :bug: Fix handling falsey values for body callback and payload. ([2d99a4f](https://github.com/elbywan/wretch/commit/2d99a4f)), closes [#58](https://github.com/elbywan/wretch/issues/58)
* :memo: Update readme browserstack badge. ([eddfd91](https://github.com/elbywan/wretch/commit/eddfd91))
* :white_check_mark: Restore latest browserstack matrix and add an exception for firefox CI. ([ef09fd8](https://github.com/elbywan/wretch/commit/ef09fd8))
* :white_check_mark: Use macos firefox on browserstack ([e51048e](https://github.com/elbywan/wretch/commit/e51048e))
* 1.5.5 tag ([5b158fc](https://github.com/elbywan/wretch/commit/5b158fc))



## <small>1.5.4 (2019-07-16)</small>

* :arrow_up: Upgrade packages to fix vulnerabilities. ([dced4c1](https://github.com/elbywan/wretch/commit/dced4c1))
* :memo: Fix readme opts link ([5595ef7](https://github.com/elbywan/wretch/commit/5595ef7))
* :white_check_mark: Add missing browser test ([2f5498c](https://github.com/elbywan/wretch/commit/2f5498c))
* :white_check_mark: Add missing browser tests ([9bd7e4f](https://github.com/elbywan/wretch/commit/9bd7e4f))
* :white_check_mark: Fix browserstack browser & os matrix. ([451ef23](https://github.com/elbywan/wretch/commit/451ef23))
* 1.5.4 tag ([2b79b3d](https://github.com/elbywan/wretch/commit/2b79b3d))
* Add test ([62a3501](https://github.com/elbywan/wretch/commit/62a3501))
* Pass method option to defer callback ([a45ac65](https://github.com/elbywan/wretch/commit/a45ac65))



## <small>1.5.3 (2019-07-11)</small>

* :arrow_up: Upgrade dependencies ([5e77291](https://github.com/elbywan/wretch/commit/5e77291))
* :bug: Preserve headers on null/undefined argument ([9e3fe0a](https://github.com/elbywan/wretch/commit/9e3fe0a)), closes [#52](https://github.com/elbywan/wretch/issues/52)
* 1.5.3 tag ([9fe16a8](https://github.com/elbywan/wretch/commit/9fe16a8))
* squashme ([a3fff82](https://github.com/elbywan/wretch/commit/a3fff82))



## <small>1.5.2 (2019-04-28)</small>

* :bug: Clear pending timeout when request resolves / fails ([687570b](https://github.com/elbywan/wretch/commit/687570b)), closes [#50](https://github.com/elbywan/wretch/issues/50)
* :memo: Add 1.5.1 changelog ([fd4386c](https://github.com/elbywan/wretch/commit/fd4386c))
* :memo: Fix .catcher documentation typo. ([2b98d6b](https://github.com/elbywan/wretch/commit/2b98d6b))
* :memo: Remove bad usage of .error in the readme ([a5209d0](https://github.com/elbywan/wretch/commit/a5209d0))
* 1.5.2 tag ([f71faef](https://github.com/elbywan/wretch/commit/f71faef))
* Update README.md ([6c3a271](https://github.com/elbywan/wretch/commit/6c3a271))



## <small>1.5.1 (2019-03-17)</small>

* :arrow_up: Upgrade rollup dep ([d890b8a](https://github.com/elbywan/wretch/commit/d890b8a))
* :bug: Fix mutating catchers propagation to cloned wretchers ([d207027](https://github.com/elbywan/wretch/commit/d207027)), closes [#44](https://github.com/elbywan/wretch/issues/44)
* :memo: Add the concept of middleware context to the readme. ([50a78c5](https://github.com/elbywan/wretch/commit/50a78c5))
* :memo: Change package kb size displayed in the html ([b3ebb78](https://github.com/elbywan/wretch/commit/b3ebb78))
* :white_check_mark: CI build on node.js LTS ([90290ab](https://github.com/elbywan/wretch/commit/90290ab))
* :white_check_mark: Test form-data with streams. ([92af63a](https://github.com/elbywan/wretch/commit/92af63a))
* 1.5.1 tag ([2f5af21](https://github.com/elbywan/wretch/commit/2f5af21))



## 1.5.0 (2019-02-23)

* :arrow_up: Upgrade dependencies and fix package version in lock file ([b17d10a](https://github.com/elbywan/wretch/commit/b17d10a))
* :arrow_up: Upgrade jest and rollup ([0573f7a](https://github.com/elbywan/wretch/commit/0573f7a))
* :art: Add inline source maps ([03ca27e](https://github.com/elbywan/wretch/commit/03ca27e))
* :factory: Add a replay() method. ([5af4ecc](https://github.com/elbywan/wretch/commit/5af4ecc)), closes [#35](https://github.com/elbywan/wretch/issues/35)
* :memo: More details about the response types in the readme ([270fe16](https://github.com/elbywan/wretch/commit/270fe16))
* 1.5.0 tag ([05e07ac](https://github.com/elbywan/wretch/commit/05e07ac))



## <small>1.4.2 (2018-10-21)</small>

* :arrow_up: Upgrade packages ([268565d](https://github.com/elbywan/wretch/commit/268565d))
* :art: Export typedefs at the root level ([d2bcb13](https://github.com/elbywan/wretch/commit/d2bcb13))
* :memo: Fix readme typo ([78b7a2b](https://github.com/elbywan/wretch/commit/78b7a2b))
* :memo: Update .query documentation ([03c5cbe](https://github.com/elbywan/wretch/commit/03c5cbe))
* :white_check_mark: Improve performance timings test coverage ([c4db506](https://github.com/elbywan/wretch/commit/c4db506))
* 1.4.2 tag ([e53622d](https://github.com/elbywan/wretch/commit/e53622d))
* Update README.md ([5c9c35e](https://github.com/elbywan/wretch/commit/5c9c35e))



## <small>1.4.1 (2018-08-13)</small>

* :arrow_up: 1.4.1 tag ([429fd8d](https://github.com/elbywan/wretch/commit/429fd8d))
* :arrow_up: Upgrade devDeps ([0a6c223](https://github.com/elbywan/wretch/commit/0a6c223))
* :art: Improve typedefs ([232c063](https://github.com/elbywan/wretch/commit/232c063))
* :bug: Add default errorType to response object ([c134efa](https://github.com/elbywan/wretch/commit/c134efa))
* :white_check_mark: Improve unit tests to check default error type ([3f1bb4b](https://github.com/elbywan/wretch/commit/3f1bb4b)), closes [#c134](https://github.com/elbywan/wretch/issues/c134)
* :white_check_mark: Prevent running browserstack on PRs ([c350060](https://github.com/elbywan/wretch/commit/c350060))
* Update README.md ([ff5692d](https://github.com/elbywan/wretch/commit/ff5692d))



## 1.4.0 (2018-07-10)

* :arrow_up: 1.4.0 tag ([27acc8e](https://github.com/elbywan/wretch/commit/27acc8e))
* :fire: Make .formUrl encode arrays in a standard way ([f04c9af](https://github.com/elbywan/wretch/commit/f04c9af)), closes [#26](https://github.com/elbywan/wretch/issues/26)
* Update README.md ([e3e9701](https://github.com/elbywan/wretch/commit/e3e9701))
* Update README.md ([74ad74c](https://github.com/elbywan/wretch/commit/74ad74c))



## <small>1.3.1 (2018-06-12)</small>

* :arrow_up: 1.3.1 tag ([f162e0e](https://github.com/elbywan/wretch/commit/f162e0e))
* :art: Launch the mock server aside of the test file. ([35c5a4e](https://github.com/elbywan/wretch/commit/35c5a4e))
* :memo: Add bundlephobia badge. ([0399a65](https://github.com/elbywan/wretch/commit/0399a65))
* :memo: Add paypal badge ([cd98e4d](https://github.com/elbywan/wretch/commit/cd98e4d))
* :memo: Fix broken readme links. ([75f767d](https://github.com/elbywan/wretch/commit/75f767d))
* :memo: Mention browserstack in the readme. ([2f6ad8e](https://github.com/elbywan/wretch/commit/2f6ad8e))
* :memo: Update readme package version ([04f75ce](https://github.com/elbywan/wretch/commit/04f75ce))
* ✅ Add jasmine browser tests & integrate with browserstack. ([4c946bb](https://github.com/elbywan/wretch/commit/4c946bb))



## 1.3.0 (2018-06-09)

* :arrow_up: 1.3.0 tag ([ff05dfc](https://github.com/elbywan/wretch/commit/ff05dfc))
* :bug: Fix .url call when the url contains query parameters ([e68764f](https://github.com/elbywan/wretch/commit/e68764f))
* :factory: Add deferred callback chain. ([10ddfe5](https://github.com/elbywan/wretch/commit/10ddfe5))
* :fire: Add body argument shorthand to the http methods. ([103cde3](https://github.com/elbywan/wretch/commit/103cde3))
* :memo: Mention the wretch-middlewares package in the readme ([880c02c](https://github.com/elbywan/wretch/commit/880c02c))
* :memo: Update .query anchor ([b2670d9](https://github.com/elbywan/wretch/commit/b2670d9))



## 1.2.0 (2018-05-24)

* :arrow_up: 1.2.0 tag ([3f067df](https://github.com/elbywan/wretch/commit/3f067df))
* :factory: Accept string argument in .query() #20 ([b53cca3](https://github.com/elbywan/wretch/commit/b53cca3)), closes [#20](https://github.com/elbywan/wretch/issues/20)
* :fire: Make .query() chainable #20 ([1a6a7c8](https://github.com/elbywan/wretch/commit/1a6a7c8)), closes [#20](https://github.com/elbywan/wretch/issues/20)
* :white_check_mark: Add more node.js versions used by the travis CI ([7d6d779](https://github.com/elbywan/wretch/commit/7d6d779))
* :white_check_mark: Fixes for node.js v10 ([0dcba96](https://github.com/elbywan/wretch/commit/0dcba96))
* ⬆️ Upgrade dev dependencies ([57c6c6f](https://github.com/elbywan/wretch/commit/57c6c6f))
* add monthly downloads badge ([386f340](https://github.com/elbywan/wretch/commit/386f340))
* small website style update ([970b19e](https://github.com/elbywan/wretch/commit/970b19e))



## <small>1.1.2 (2018-03-07)</small>

* :arrow_up: 1.1.2 tag ([f4e9ffe](https://github.com/elbywan/wretch/commit/f4e9ffe))
* :art: Relaxed Response & Options types ([16c0b97](https://github.com/elbywan/wretch/commit/16c0b97))
* :white_check_mark: Update tests with a working abortController polyfill ([171ac48](https://github.com/elbywan/wretch/commit/171ac48))
* ⬆️ Update packages ([de2b842](https://github.com/elbywan/wretch/commit/de2b842))
* Update README.md ([eddeba7](https://github.com/elbywan/wretch/commit/eddeba7))



## <small>1.1.1 (2018-01-08)</small>

* :arrow_up: 1.1.1 tag ([efc67a4](https://github.com/elbywan/wretch/commit/efc67a4))
* :art: Remove typo ([7883219](https://github.com/elbywan/wretch/commit/7883219))
* :factory: Pass the original request to the catchers/resolvers callback ([1e4d3a4](https://github.com/elbywan/wretch/commit/1e4d3a4))
* :memo: Update middleware and intro ([09b0dc1](https://github.com/elbywan/wretch/commit/09b0dc1))
* ⬆️ Update packages ([e5cf536](https://github.com/elbywan/wretch/commit/e5cf536))



## 1.1.0 (2017-11-17)

* :arrow_up: 1.1.0 tag ([75e0c68](https://github.com/elbywan/wretch/commit/75e0c68))
* :art: Comply with the commonjs typescript transpilation (#10) ([6931ff6](https://github.com/elbywan/wretch/commit/6931ff6)), closes [#10](https://github.com/elbywan/wretch/issues/10)
* :art: Refactor method function call ([cf07316](https://github.com/elbywan/wretch/commit/cf07316))
* :art: Remove irregular whitespace ([7bc2990](https://github.com/elbywan/wretch/commit/7bc2990))
* :bug: Fix es6 const generated by rollup typescript helpers ([6791721](https://github.com/elbywan/wretch/commit/6791721)), closes [#11](https://github.com/elbywan/wretch/issues/11)
* :factory: Add middlewares helper. (#12) ([b9c6a65](https://github.com/elbywan/wretch/commit/b9c6a65)), closes [#12](https://github.com/elbywan/wretch/issues/12)
* :memo: Adding middlewares code samples (#12). ([b43cb1b](https://github.com/elbywan/wretch/commit/b43cb1b)), closes [#12](https://github.com/elbywan/wretch/issues/12)
* :memo: Update npm badge color ([0eae7bb](https://github.com/elbywan/wretch/commit/0eae7bb))
* :memo: Update readme top message and remove experimental flag for aborting requests feature ([e449b46](https://github.com/elbywan/wretch/commit/e449b46))
* ⬆️ Update packages ([41834e0](https://github.com/elbywan/wretch/commit/41834e0))



## 1.0.0 (2017-10-20)

* :arrow_up: 1.0.0 tag ([63b7d2b](https://github.com/elbywan/wretch/commit/63b7d2b))
* :art: Widen resolver return type ([6e2b299](https://github.com/elbywan/wretch/commit/6e2b299))
* :factory: Add auth method to set the Authorization header. ([1694396](https://github.com/elbywan/wretch/commit/1694396))
* :factory: Add early resolvers with the resolve function ([481803b](https://github.com/elbywan/wretch/commit/481803b))
* :factory: Add HEAD and OPTIONS http methods. ([3c30844](https://github.com/elbywan/wretch/commit/3c30844))
* :memo: Add homepage usage section, tagboxes and footer ([fd3bcf7](https://github.com/elbywan/wretch/commit/fd3bcf7))
* :memo: Bypass jekyll ([22c957c](https://github.com/elbywan/wretch/commit/22c957c))
* :memo: Fix readme typo ([9d1b4c6](https://github.com/elbywan/wretch/commit/9d1b4c6))
* :memo: Readme modifications : fix method links, simplify polyfills, add homepage links ([e37ea0b](https://github.com/elbywan/wretch/commit/e37ea0b))
* :white_check_mark: Migrate from mocha to jest ([f67bd84](https://github.com/elbywan/wretch/commit/f67bd84))



## <small>0.3.1 (2017-10-09)</small>

* :arrow_up: 0.3.1 tag ([ccca2dc](https://github.com/elbywan/wretch/commit/ccca2dc))
* :memo: Add homepage in package.json ([c78a5dd](https://github.com/elbywan/wretch/commit/c78a5dd))



## 0.3.0 (2017-10-09)

* :arrow_up: 0.3.0 tag ([a9450c1](https://github.com/elbywan/wretch/commit/a9450c1))
* :art: Add polyfill getter method ([ca49cfc](https://github.com/elbywan/wretch/commit/ca49cfc))
* :art: Can now catch on error name ([2a0f7e9](https://github.com/elbywan/wretch/commit/2a0f7e9))
* :checkered_flag: Refactor perfs() to improve robustness and performance ([7b2b27c](https://github.com/elbywan/wretch/commit/7b2b27c))
* :factory: Abortable requests ([c5888fe](https://github.com/elbywan/wretch/commit/c5888fe)), closes [#7](https://github.com/elbywan/wretch/issues/7)
* :factory: Add formUrl body type ([64f6c3e](https://github.com/elbywan/wretch/commit/64f6c3e)), closes [#9](https://github.com/elbywan/wretch/issues/9)
* :fire:  The .options function now mixin by default ([47b4630](https://github.com/elbywan/wretch/commit/47b4630))
* :fire: Remove .baseUrl and change .url behaviour ([5142b02](https://github.com/elbywan/wretch/commit/5142b02)), closes [#8](https://github.com/elbywan/wretch/issues/8)
* :memo Clarify usage in readme ([f297512](https://github.com/elbywan/wretch/commit/f297512))
* :memo: Add methods indexes and clarify some point in the readme ([54dae1c](https://github.com/elbywan/wretch/commit/54dae1c))
* :memo: Add minimalist companion website. ([10f2197](https://github.com/elbywan/wretch/commit/10f2197))
* :memo: Add readme announcement. ([d87a57d](https://github.com/elbywan/wretch/commit/d87a57d))
* :memo: Fix readme typo ([85852a6](https://github.com/elbywan/wretch/commit/85852a6))
* :memo: Fixed readme usage layout ([7f8ea0f](https://github.com/elbywan/wretch/commit/7f8ea0f))
* :memo: Update readme ([7881e2c](https://github.com/elbywan/wretch/commit/7881e2c))



## <small>0.2.4 (2017-10-06)</small>

* :arrow_up: 0.2.4 tag ([879e14a](https://github.com/elbywan/wretch/commit/879e14a))
* :bug: Fix perfs() concurrency issues ([79f86ce](https://github.com/elbywan/wretch/commit/79f86ce))



## <small>0.2.3 (2017-10-06)</small>

* :arrow_up: 0.2.3 tag ([cce504c](https://github.com/elbywan/wretch/commit/cce504c))
* :art: Add module field in package.json ([90431ff](https://github.com/elbywan/wretch/commit/90431ff))
* :art: Add node.js partial support to the perf function ([0045672](https://github.com/elbywan/wretch/commit/0045672))
* :art: Hide the changelog preset beneath a scripts folder + rewrite ([696503c](https://github.com/elbywan/wretch/commit/696503c))
* :factory: Highly experimental perfs function. ([6fa1d29](https://github.com/elbywan/wretch/commit/6fa1d29))
* :memo: Correct errorType typo ([e058b7a](https://github.com/elbywan/wretch/commit/e058b7a))
* :memo: Fix contributing typo ([d12e29c](https://github.com/elbywan/wretch/commit/d12e29c))
* :memo: Perfs() documentation ([6c90e15](https://github.com/elbywan/wretch/commit/6c90e15))
* :memo: Readme : image cdn and shorten unpkg link ([8eac8c9](https://github.com/elbywan/wretch/commit/8eac8c9))
* :white_check_mark: Write perfs() tests ([3a14499](https://github.com/elbywan/wretch/commit/3a14499))



## <small>0.2.2 (2017-10-04)</small>

* :arrow_up: 0.2.2 tag ([0883134](https://github.com/elbywan/wretch/commit/0883134))
* :art: Moves polyfills to the config object ([2820e34](https://github.com/elbywan/wretch/commit/2820e34))
* :factory: Allow non-global fetch & FormData ([112b9cc](https://github.com/elbywan/wretch/commit/112b9cc))



## <small>0.2.1 (2017-10-03)</small>

* :arrow_up: 0.2.1 tag ([d13e8ad](https://github.com/elbywan/wretch/commit/d13e8ad))
* :art: Add custom changelog preset ([023a73c](https://github.com/elbywan/wretch/commit/023a73c))
* :art: change changelog format to atom ([970bf7b](https://github.com/elbywan/wretch/commit/970bf7b))
* :bug: Fix baseUrl not mixing in options ([5c90df4](https://github.com/elbywan/wretch/commit/5c90df4))
* :memo: Add badges ([d29c96d](https://github.com/elbywan/wretch/commit/d29c96d))
* :memo: Regenerate changelog ([c14ede7](https://github.com/elbywan/wretch/commit/c14ede7))
* :memo: Update contributing guidelines ([b96022d](https://github.com/elbywan/wretch/commit/b96022d))



## 0.2.0 (2017-10-03)

* :arrow_up: 0.2.0 tag ([d903c48](https://github.com/elbywan/wretch/commit/d903c48))
* :fire: :art: Replace mixdefaults with a mixin flag. ([c497f6e](https://github.com/elbywan/wretch/commit/c497f6e))
* :memo: Create CONTRIBUTING.md ([c79578a](https://github.com/elbywan/wretch/commit/c79578a))
* :memo: Update readme with unpkg ([1131755](https://github.com/elbywan/wretch/commit/1131755))
* :memo: Update README.md ([b8f3cc8](https://github.com/elbywan/wretch/commit/b8f3cc8))



## <small>0.1.5 (2017-10-03)</small>

* :arrow_up: 0.1.5 tag ([6551424](https://github.com/elbywan/wretch/commit/6551424))
* :art: Update changelog ([7717052](https://github.com/elbywan/wretch/commit/7717052))
* :checkered_flag: Use a Map instead of an Array for catchers ([dba8e63](https://github.com/elbywan/wretch/commit/dba8e63))



## <small>0.1.4 (2017-10-03)</small>

* :arrow_up; 0.1.4 tag ([525d9f7](https://github.com/elbywan/wretch/commit/525d9f7))
* :art: Better changelog ([d4ae365](https://github.com/elbywan/wretch/commit/d4ae365))
* :checkered_flag: [mix] small perf improvements ([fb319eb](https://github.com/elbywan/wretch/commit/fb319eb))
* :factory: Add changelog ([457852d](https://github.com/elbywan/wretch/commit/457852d))
* :factory: Add global catchers with the catcher method ([04b5cb9](https://github.com/elbywan/wretch/commit/04b5cb9))
* :memo: Fix typos ([ad0d612](https://github.com/elbywan/wretch/commit/ad0d612))
* :memo: Fix typos ([6b074dc](https://github.com/elbywan/wretch/commit/6b074dc))
* :memo: Update README.md ([ff48732](https://github.com/elbywan/wretch/commit/ff48732))



## <small>0.1.3 (2017-10-03)</small>

* :arrow_up: 0.1.3 tag ([c8ad85e](https://github.com/elbywan/wretch/commit/c8ad85e))
* :arrow_up: Update deps ([aec23f0](https://github.com/elbywan/wretch/commit/aec23f0))
* :art: Add gitattributes ([45329a4](https://github.com/elbywan/wretch/commit/45329a4))
* :art: Add tslint ([0078004](https://github.com/elbywan/wretch/commit/0078004))
* :art: Code split ([d3e725a](https://github.com/elbywan/wretch/commit/d3e725a))
* :art: Update .gitattributes ([52eebb1](https://github.com/elbywan/wretch/commit/52eebb1))
* :bug: Fix typos in mergeArrays ([966cbeb](https://github.com/elbywan/wretch/commit/966cbeb))
* :factory: Add headers/content/body methods and better options type. ([3c9c10e](https://github.com/elbywan/wretch/commit/3c9c10e))
* :memo: Clearer README ([4579bb6](https://github.com/elbywan/wretch/commit/4579bb6))
* :memo: Update README.md ([743b7d5](https://github.com/elbywan/wretch/commit/743b7d5))
* :memo: Update README.md ([11094dd](https://github.com/elbywan/wretch/commit/11094dd))
* :memo: Update README.md ([9bc38dd](https://github.com/elbywan/wretch/commit/9bc38dd))



## <small>0.1.2 (2017-10-03)</small>

* :arrow_up: 0.1.2 tag ([eb3a094](https://github.com/elbywan/wretch/commit/eb3a094))
* :art: Correct types ([f6aeb64](https://github.com/elbywan/wretch/commit/f6aeb64))
* :art: Improve typescript definitions ([b8d4e96](https://github.com/elbywan/wretch/commit/b8d4e96))
* :factory: Add baseUrl ([a0107c9](https://github.com/elbywan/wretch/commit/a0107c9)), closes [#2](https://github.com/elbywan/wretch/issues/2)
* :memo: Readme update ([e2e3522](https://github.com/elbywan/wretch/commit/e2e3522))
* :memo: Readme update ([3cb3b23](https://github.com/elbywan/wretch/commit/3cb3b23))
* :memo: Typo fix ([6a06919](https://github.com/elbywan/wretch/commit/6a06919))
* :memo: Update README.md ([ae0c9c0](https://github.com/elbywan/wretch/commit/ae0c9c0))



## <small>0.1.1 (2017-10-03)</small>

* :arrow_up: 0.1.1 tag ([f054836](https://github.com/elbywan/wretch/commit/f054836))
* :art: Correct optional callbacks in declaration files ([0b37983](https://github.com/elbywan/wretch/commit/0b37983))



## 0.1.0 (2017-10-03)

* :arrow_up: 0.1.0 tag ([2d161d6](https://github.com/elbywan/wretch/commit/2d161d6))
* :art: Add coverage ([517ee5d](https://github.com/elbywan/wretch/commit/517ee5d))
* :art: Move from webpack to rollup and restore source maps ([6515d7a](https://github.com/elbywan/wretch/commit/6515d7a))
* :fire: Remove source maps ([338f080](https://github.com/elbywan/wretch/commit/338f080))
* :memo: Add documentation ([5cae7f3](https://github.com/elbywan/wretch/commit/5cae7f3))
* :white_check_mark: Improve coverage ([5b10a93](https://github.com/elbywan/wretch/commit/5b10a93))



## <small>0.0.1 (2017-10-03)</small>

* :arrow_up: 0.0.1 tag ([4d6eeed](https://github.com/elbywan/wretch/commit/4d6eeed))
* :factory: init ([ac4ae15](https://github.com/elbywan/wretch/commit/ac4ae15))
* Initial commit ([494dbf8](https://github.com/elbywan/wretch/commit/494dbf8))



