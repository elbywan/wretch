<a name="3.0.4"></a>
## [3.0.4](https://github.com/elbywan/wretch/compare/3.0.3...3.0.4) (2025-11-26)


### :arrow_up: Version update(s)

* Bump glob ([49a5e53](https://github.com/elbywan/wretch/commit/49a5e53))
* Bump js-yaml from 4.1.0 to 4.1.1 ([43882e1](https://github.com/elbywan/wretch/commit/43882e1))

### :bug: Bug fix(es)

* Improve body size computation when tracking upload progress ([bfae158](https://github.com/elbywan/wretch/commit/bfae158)), closes [#284](https://github.com/elbywan/wretch/issues/284)



<a name="3.0.3"></a>
## [3.0.3](https://github.com/elbywan/wretch/compare/3.0.2...3.0.3) (2025-11-10)


### :bug: Bug fix(es)

* Use body size when available to compute upload total bytes ([27c0443](https://github.com/elbywan/wretch/commit/27c0443)), closes [#278](https://github.com/elbywan/wretch/issues/278)

### :white_check_mark: Test improvement(s)

* Migrate documentation examples from httpbun.org to htt ([df84f73](https://github.com/elbywan/wretch/commit/df84f73))



<a name="3.0.2"></a>
## [3.0.2](https://github.com/elbywan/wretch/compare/3.0.1...3.0.2) (2025-10-24)


### :bug: Bug fix(es)

* Clone the body before assigning to WretchError message ([5379037](https://github.com/elbywan/wretch/commit/5379037)), closes [#277](https://github.com/elbywan/wretch/issues/277)



<a name="3.0.1"></a>
## [3.0.1](https://github.com/elbywan/wretch/compare/3.0.0...3.0.1) (2025-10-21)


### :bug: Bug fix(es)

* Fix malformed package.json key ([ddf3b4c](https://github.com/elbywan/wretch/commit/ddf3b4c))

### :memo: Documentation update(s)

* Fix typescript API links ([831598a](https://github.com/elbywan/wretch/commit/831598a))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/elbywan/wretch/compare/2.11.1...3.0.0) (2025-10-19)


### :arrow_up: Version update(s)

* Migrate to rolldown ([219f1ce](https://github.com/elbywan/wretch/commit/219f1ce))
* Upgrade packages ([da968b2](https://github.com/elbywan/wretch/commit/da968b2))
* Upgrade packages ([ae05a13](https://github.com/elbywan/wretch/commit/ae05a13))

### :art: Code improvement(s)

* Add automated npm publishing workflow ([745b8a0](https://github.com/elbywan/wretch/commit/745b8a0))
* Golf bytes ([b0316f1](https://github.com/elbywan/wretch/commit/b0316f1))
* Improve .customError typings ([6efdb24](https://github.com/elbywan/wretch/commit/6efdb24))
* Remove deno related docuentation and tests ([1ceac88](https://github.com/elbywan/wretch/commit/1ceac88))
* Remove global config and dead code ([bdb8134](https://github.com/elbywan/wretch/commit/bdb8134))
* Use proto to manage tools ([23f22e4](https://github.com/elbywan/wretch/commit/23f22e4))

### :bug: Bug fix(es)

* Fix custom error conflicting with catchers ([0486e49](https://github.com/elbywan/wretch/commit/0486e49))

### :checkered_flag: Performance update(s)

* Add bun tests ([df0e075](https://github.com/elbywan/wretch/commit/df0e075))
* Add deno tests ([c02f1e8](https://github.com/elbywan/wretch/commit/c02f1e8))
* Add workflow to test code snippets ([f036a71](https://github.com/elbywan/wretch/commit/f036a71))
* Improve mock server lifecycle ([68d1a0f](https://github.com/elbywan/wretch/commit/68d1a0f))
* Improve snippet testing ([299bd90](https://github.com/elbywan/wretch/commit/299bd90))
* Replace karma with web-test-runner ([5b4215c](https://github.com/elbywan/wretch/commit/5b4215c))
* Test all the documentation snippets and rework recipes ([a8ae915](https://github.com/elbywan/wretch/commit/a8ae915))
* Unify tests ([ab95d83](https://github.com/elbywan/wretch/commit/ab95d83))

### :factory: New feature(s)

* Accept multiple addons when calling .addon ([91c6024](https://github.com/elbywan/wretch/commit/91c6024))
* Add attempt argument to the onRetry callback ([0cfb31c](https://github.com/elbywan/wretch/commit/0cfb31c))
* Add request parameter to .customError transformer ([4347e4b](https://github.com/elbywan/wretch/commit/4347e4b))
* Upload progress support ([012b233](https://github.com/elbywan/wretch/commit/012b233))

### :feature: undefined

* Add .toFetch method ([aa8ef0a](https://github.com/elbywan/wretch/commit/aa8ef0a))

### :fire: Breaking change(s)

* Consolidate addon optional parameters into options objects ([dfe5860](https://github.com/elbywan/wretch/commit/dfe5860))
* Remove .errorType and introduce .customError ([fdf4371](https://github.com/elbywan/wretch/commit/fdf4371))
* Remove node <22 compatibility ([304c7ff](https://github.com/elbywan/wretch/commit/304c7ff))
* Remove static methods ([ff703f7](https://github.com/elbywan/wretch/commit/ff703f7))
* Skip retrying 4xx errors by default in retry middleware ([a63e471](https://github.com/elbywan/wretch/commit/a63e471)), closes [#176](https://github.com/elbywan/wretch/issues/176)

### :memo: Documentation update(s)

* Add issue links to the recipes ([5aa7146](https://github.com/elbywan/wretch/commit/5aa7146))
* Improve documentation ([7f69396](https://github.com/elbywan/wretch/commit/7f69396))
* Init recipes ([37dccac](https://github.com/elbywan/wretch/commit/37dccac))
* Migration guide ([5faaceb](https://github.com/elbywan/wretch/commit/5faaceb))
* Niceify website ([64d7ade](https://github.com/elbywan/wretch/commit/64d7ade))

### :white_check_mark: Test improvement(s)

* Remove jest in favour of node:test ([bd0d3e1](https://github.com/elbywan/wretch/commit/bd0d3e1))



<a name="2.11.1"></a>
## [2.11.1](https://github.com/elbywan/wretch/compare/2.11.0...2.11.1) (2025-10-19)


### :arrow_up: Version update(s)

* Bump axios from 1.10.0 to 1.11.0 ([88e6554](https://github.com/elbywan/wretch/commit/88e6554))
* Bump axios from 1.7.7 to 1.10.0 ([2ccb6fa](https://github.com/elbywan/wretch/commit/2ccb6fa))
* Bump cookie, light-my-request and socket.io ([891b26e](https://github.com/elbywan/wretch/commit/891b26e))
* Bump form-data from 4.0.0 to 4.0.4 ([1b1bdac](https://github.com/elbywan/wretch/commit/1b1bdac))
* Bump serialize-javascript from 6.0.1 to 6.0.2 ([ae8918f](https://github.com/elbywan/wretch/commit/ae8918f))
* Bump tmp from 0.2.1 to 0.2.4 ([9355826](https://github.com/elbywan/wretch/commit/9355826))

### :bug: Bug fix(es)

* Ignore parsing errors in errorType('json') ([974e8fa](https://github.com/elbywan/wretch/commit/974e8fa)), closes [#266](https://github.com/elbywan/wretch/issues/266)

### :memo: Documentation update(s)

* Better retry code snippets types ([6dbdedc](https://github.com/elbywan/wretch/commit/6dbdedc)), closes [#255](https://github.com/elbywan/wretch/issues/255)

### :white_check_mark: Test improvement(s)

* Fix node22 delay middleware test ([0e0b30f](https://github.com/elbywan/wretch/commit/0e0b30f))



<a name="2.11.0"></a>
# [2.11.0](https://github.com/elbywan/wretch/compare/2.10.0...2.11.0) (2024-10-29)


### :arrow_up: Version update(s)

* Bump body-parser from 1.20.0 to 1.20.3 ([598ce94](https://github.com/elbywan/wretch/commit/598ce94))
* Bump rollup from 4.5.0 to 4.22.4 ([75f9db7](https://github.com/elbywan/wretch/commit/75f9db7))

### :factory: New feature(s)

* Add partial typing for the wretch options ([e778f88](https://github.com/elbywan/wretch/commit/e778f88)), closes [#253](https://github.com/elbywan/wretch/issues/253) [#251](https://github.com/elbywan/wretch/issues/251)



<a name="2.10.0"></a>
# [2.10.0](https://github.com/elbywan/wretch/compare/2.9.1...2.10.0) (2024-09-13)


### :arrow_up: Version update(s)

* Bump axios from 1.6.2 to 1.7.7 ([4542c28](https://github.com/elbywan/wretch/commit/4542c28))

### :art: Code improvement(s)

* Expand eslint ignore list ([cdad424](https://github.com/elbywan/wretch/commit/cdad424))
* Properly build commonjs ([c7f00fc](https://github.com/elbywan/wretch/commit/c7f00fc)), closes [#247](https://github.com/elbywan/wretch/issues/247)



<a name="2.9.1"></a>
## [2.9.1](https://github.com/elbywan/wretch/compare/2.9.0...2.9.1) (2024-09-06)


### :arrow_up: Version update(s)

* Bump braces from 3.0.2 to 3.0.3 ([a50cdf6](https://github.com/elbywan/wretch/commit/a50cdf6))
* Bump ws and socket.io ([c615396](https://github.com/elbywan/wretch/commit/c615396))

### :art: Code improvement(s)

* Enhance errorType and allow disabling it ([cfd45a9](https://github.com/elbywan/wretch/commit/cfd45a9))
* Replace tslint with eslint ([661865a](https://github.com/elbywan/wretch/commit/661865a))
* Replace URL.canParse with a try/catch block ([f6fc851](https://github.com/elbywan/wretch/commit/f6fc851)), closes [#244](https://github.com/elbywan/wretch/issues/244)

### :memo: Documentation update(s)

* Regenerate api docs ([bc1f570](https://github.com/elbywan/wretch/commit/bc1f570))
* Replace bundlephobia badge with bundlejs ([b9f27a7](https://github.com/elbywan/wretch/commit/b9f27a7))



<a name="2.9.0"></a>
# [2.9.0](https://github.com/elbywan/wretch/compare/2.8.1...2.9.0) (2024-06-01)


### :arrow_up: Version update(s)

* Bump follow-redirects from 1.15.4 to 1.15.6 ([6204bec](https://github.com/elbywan/wretch/commit/6204bec))
* Install firefox in the CI env ([c80ad35](https://github.com/elbywan/wretch/commit/c80ad35))

### :bug: Bug fix(es)

* Do not jasonify FormData instances ([4693837](https://github.com/elbywan/wretch/commit/4693837)), closes [#231](https://github.com/elbywan/wretch/issues/231)

### :factory: New feature(s)

* Add BasicAuth addon ([ad5b591](https://github.com/elbywan/wretch/commit/ad5b591))



<a name="2.8.1"></a>
## [2.8.1](https://github.com/elbywan/wretch/compare/2.8.0...2.8.1) (2024-03-07)


### :arrow_up: Version update(s)

* Bump follow-redirects from 1.15.1 to 1.15.4 ([04fada6](https://github.com/elbywan/wretch/commit/04fada6))

### :bug: Bug fix(es)

* Fix error callback type missing addons extensions ([99a21a8](https://github.com/elbywan/wretch/commit/99a21a8)), closes [#222](https://github.com/elbywan/wretch/issues/222)



<a name="2.8.0"></a>
# [2.8.0](https://github.com/elbywan/wretch/compare/2.7.1...2.8.0) (2023-12-30)


### :factory: New feature(s)

* addon.resolver can now be a function ([0bf9aa8](https://github.com/elbywan/wretch/commit/0bf9aa8)), closes [#212](https://github.com/elbywan/wretch/issues/212)



<a name="2.7.1"></a>
## [2.7.1](https://github.com/elbywan/wretch/compare/2.7.0...2.7.1) (2023-11-19)


### :arrow_up: Version update(s)

* Bump @babel/traverse from 7.19.4 to 7.23.2 ([922005e](https://github.com/elbywan/wretch/commit/922005e))
* Upgrade dependencies ([d774826](https://github.com/elbywan/wretch/commit/d774826))

### :bug: Bug fix(es)

* Fix passing Headers/entries array as an argument to headers() ([f32845a](https://github.com/elbywan/wretch/commit/f32845a)), closes [#205](https://github.com/elbywan/wretch/issues/205)



<a name="2.7.0"></a>
# [2.7.0](https://github.com/elbywan/wretch/compare/2.6.0...2.7.0) (2023-09-12)


### :factory: New feature(s)

* Support FileList objects in the form data addon ([3582809](https://github.com/elbywan/wretch/commit/3582809)), closes [#201](https://github.com/elbywan/wretch/issues/201)

### :memo: Documentation update(s)

* Mention file names in the form data addon doc ([411fb09](https://github.com/elbywan/wretch/commit/411fb09)), closes [#197](https://github.com/elbywan/wretch/issues/197)



<a name="2.6.0"></a>
# [2.6.0](https://github.com/elbywan/wretch/compare/2.5.2...2.6.0) (2023-06-28)


### :arrow_up: Version update(s)

* Bump engine.io and socket.io ([3ef1738](https://github.com/elbywan/wretch/commit/3ef1738))
* Bump socket.io-parser from 4.2.2 to 4.2.3 ([b42aa0f](https://github.com/elbywan/wretch/commit/b42aa0f))
* Upgrade dependencies ([b183cf7](https://github.com/elbywan/wretch/commit/b183cf7))

### :factory: New feature(s)

* Add fallback catcher method ([46610cf](https://github.com/elbywan/wretch/commit/46610cf)), closes [#192](https://github.com/elbywan/wretch/issues/192)

### :memo: Documentation update(s)

* Update node-fetch code snippet ([3b6ac7e](https://github.com/elbywan/wretch/commit/3b6ac7e)), closes [#179](https://github.com/elbywan/wretch/issues/179)



<a name="2.5.2"></a>
## [2.5.2](https://github.com/elbywan/wretch/compare/2.5.1...2.5.2) (2023-04-11)


### :bug: Bug fix(es)

* Fix catcher and resolve callback argument type. ([76c295f](https://github.com/elbywan/wretch/commit/76c295f)), closes [#177](https://github.com/elbywan/wretch/issues/177)

### :memo: Documentation update(s)

* Node.js 18 section wording ([b696b1c](https://github.com/elbywan/wretch/commit/b696b1c))
* Warn to use a custom until function to avoid retrying on 4xx error ([1812c73](https://github.com/elbywan/wretch/commit/1812c73)), closes [#176](https://github.com/elbywan/wretch/issues/176)



<a name="2.5.1"></a>
## [2.5.1](https://github.com/elbywan/wretch/compare/2.5.0...2.5.1) (2023-02-27)


### :bug: Bug fix(es)

* Update resolver.ts - Add null verification to .get("Content-Type") ([a68a524](https://github.com/elbywan/wretch/commit/a68a524))



<a name="2.5.0"></a>
# [2.5.0](https://github.com/elbywan/wretch/compare/2.4.1...2.5.0) (2023-02-20)


### :arrow_up: Version update(s)

* Bump @fastify/multipart from 7.3.0 to 7.4.1 ([e6074c9](https://github.com/elbywan/wretch/commit/e6074c9))
* Bump @sideway/formula from 3.0.0 to 3.0.1 ([8208646](https://github.com/elbywan/wretch/commit/8208646))
* Bump ua-parser-js from 0.7.31 to 0.7.33 ([1694fe6](https://github.com/elbywan/wretch/commit/1694fe6))

### :factory: New feature(s)

* Parse error type as json on proper content-type ([ea9adbf](https://github.com/elbywan/wretch/commit/ea9adbf)), closes [#171](https://github.com/elbywan/wretch/issues/171)



<a name="2.4.1"></a>
## [2.4.1](https://github.com/elbywan/wretch/compare/2.4.0...2.4.1) (2023-01-20)


### :bug: Bug fix(es)

* Fix abort/progress addons state isolation issue ([2b3a659](https://github.com/elbywan/wretch/commit/2b3a659))



<a name="2.4.0"></a>
# [2.4.0](https://github.com/elbywan/wretch/compare/2.3.2...2.4.0) (2023-01-19)


### :factory: New feature(s)

* Add skip argument to the retry middleware ([746f8c9](https://github.com/elbywan/wretch/commit/746f8c9))



<a name="2.3.2"></a>
## [2.3.2](https://github.com/elbywan/wretch/compare/2.3.1...2.3.2) (2023-01-11)


### :bug: Bug fix(es)

* Fix catcher priority ([d359bd7](https://github.com/elbywan/wretch/commit/d359bd7)), closes [#162](https://github.com/elbywan/wretch/issues/162)



<a name="2.3.1"></a>
## [2.3.1](https://github.com/elbywan/wretch/compare/2.3.0...2.3.1) (2023-01-07)


### :bug: Bug fix(es)

* Fix middlewares and addons subpath exports ([bfd2542](https://github.com/elbywan/wretch/commit/bfd2542)), closes [#160](https://github.com/elbywan/wretch/issues/160)

### :memo: Documentation update(s)

* Add limitations section to the readme ([ad0a102](https://github.com/elbywan/wretch/commit/ad0a102)), closes [#159](https://github.com/elbywan/wretch/issues/159)



<a name="2.3.0"></a>
# [2.3.0](https://github.com/elbywan/wretch/compare/2.2.3...2.3.0) (2022-12-12)


### :factory: New feature(s)

* Add url property to WretchError ([a1f6ac6](https://github.com/elbywan/wretch/commit/a1f6ac6)), closes [#157](https://github.com/elbywan/wretch/issues/157)



<a name="2.2.3"></a>
## [2.2.3](https://github.com/elbywan/wretch/compare/2.2.2...2.2.3) (2022-12-09)


### :bug: Bug fix(es)

* Better error catching precedence ([107fc71](https://github.com/elbywan/wretch/commit/107fc71)), closes [#155](https://github.com/elbywan/wretch/issues/155)



<a name="2.2.2"></a>
## [2.2.2](https://github.com/elbywan/wretch/compare/2.2.1...2.2.2) (2022-12-03)


### :bug: Bug fix(es)

* Fix compatibility issue between the perfs and progress addons ([b70e8cd](https://github.com/elbywan/wretch/commit/b70e8cd))



<a name="2.2.1"></a>
## [2.2.1](https://github.com/elbywan/wretch/compare/2.2.0...2.2.1) (2022-12-03)


### :bug: Bug fix(es)

* Add missing export for the progress addon ([ebb0577](https://github.com/elbywan/wretch/commit/ebb0577))
* Add missing progress addon rollup config ([bd6c89b](https://github.com/elbywan/wretch/commit/bd6c89b))
* Register the progress addon in the .all entry point ([b01e03d](https://github.com/elbywan/wretch/commit/b01e03d))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/elbywan/wretch/compare/2.1.5...2.2.0) (2022-12-03)


### :arrow_up: Version update(s)

* Bump dependencies including outdated rollup plugins ([bcbcdc5](https://github.com/elbywan/wretch/commit/bcbcdc5))
* Bump engine.io from 6.2.0 to 6.2.1 ([6a93854](https://github.com/elbywan/wretch/commit/6a93854))
* Bump fastify from 4.9.2 to 4.10.2 ([8ae9122](https://github.com/elbywan/wretch/commit/8ae9122))

### :art: Code improvement(s)

* Add a prepare script ([17b0a76](https://github.com/elbywan/wretch/commit/17b0a76))

### :bug: Bug fix(es)

* Fix a minor Wretch type issue in addons ([23ba7b1](https://github.com/elbywan/wretch/commit/23ba7b1))

### :factory: New feature(s)

* Add progress addon ([2bae524](https://github.com/elbywan/wretch/commit/2bae524)), closes [#154](https://github.com/elbywan/wretch/issues/154)



<a name="2.1.5"></a>
## [2.1.5](https://github.com/elbywan/wretch/compare/2.1.4...2.1.5) (2022-10-15)


### :arrow_up: Version update(s)

* Bump dependencies ([6043c75](https://github.com/elbywan/wretch/commit/6043c75))
* Bump fastify from 4.3.0 to 4.8.1 ([130ccc2](https://github.com/elbywan/wretch/commit/130ccc2))

### :bug: Bug fix(es)

* Query addon should strip undefined values ([ce395b5](https://github.com/elbywan/wretch/commit/ce395b5)), closes [#148](https://github.com/elbywan/wretch/issues/148)

### :memo: Documentation update(s)

* Add timeout code sample in the readme ([beb51c8](https://github.com/elbywan/wretch/commit/beb51c8))
* Fix outdated code comments ([d4c546d](https://github.com/elbywan/wretch/commit/d4c546d))
* Fix unpkg url  in the readme ([07d4a00](https://github.com/elbywan/wretch/commit/07d4a00))



<a name="2.1.4"></a>
## [2.1.4](https://github.com/elbywan/wretch/compare/2.1.3...2.1.4) (2022-09-28)


### :bug: Bug fix(es)

* Relax the typechecker when using resolve within defer ([9e052c8](https://github.com/elbywan/wretch/commit/9e052c8)), closes [#146](https://github.com/elbywan/wretch/issues/146)



<a name="2.1.3"></a>
## [2.1.3](https://github.com/elbywan/wretch/compare/2.1.2...2.1.3) (2022-09-28)


### :bug: Bug fix(es)

* Fix the retry middleware crashing on network errors ([95cbad5](https://github.com/elbywan/wretch/commit/95cbad5)), closes [#145](https://github.com/elbywan/wretch/issues/145)



<a name="2.1.2"></a>
## [2.1.2](https://github.com/elbywan/wretch/compare/2.1.1...2.1.2) (2022-09-27)


### :art: Code improvement(s)

* Fix some linter warnings ([c1029c8](https://github.com/elbywan/wretch/commit/c1029c8))

### :bug: Bug fix(es)

* Fix type inconsistencies in the body parsers ([b7cae7e](https://github.com/elbywan/wretch/commit/b7cae7e)), closes [#143](https://github.com/elbywan/wretch/issues/143)

### :memo: Documentation update(s)

* Fix throttling cache documentation link ([f66859d](https://github.com/elbywan/wretch/commit/f66859d))



<a name="2.1.1"></a>
## [2.1.1](https://github.com/elbywan/wretch/compare/2.1.0...2.1.1) (2022-09-03)


### :bug: Bug fix(es)

* Fix typo in function name #141 ([d82cfd5](https://github.com/elbywan/wretch/commit/d82cfd5)), closes [#141](https://github.com/elbywan/wretch/issues/141)



<a name="2.1.0"></a>
# [2.1.0](https://github.com/elbywan/wretch/compare/2.0.4...2.1.0) (2022-09-03)


### :factory: New feature(s)

* Add ability to resolve with latest response to the retry middle ([60a7453](https://github.com/elbywan/wretch/commit/60a7453)), closes [#141](https://github.com/elbywan/wretch/issues/141)

### :memo: Documentation update(s)

* Remove outdated documentation entries for the retry middleware ([7a5620c](https://github.com/elbywan/wretch/commit/7a5620c))



<a name="2.0.4"></a>
## [2.0.4](https://github.com/elbywan/wretch/compare/2.0.3...2.0.4) (2022-08-18)


### :art: Code improvement(s)

* Harmonize WretchError types ([1981837](https://github.com/elbywan/wretch/commit/1981837))



<a name="2.0.3"></a>
## [2.0.3](https://github.com/elbywan/wretch/compare/2.0.2...2.0.3) (2022-08-16)


### :art: Code improvement(s)

* Export WretchError from the root index ([76f9096](https://github.com/elbywan/wretch/commit/76f9096)), closes [#79](https://github.com/elbywan/wretch/issues/79)



<a name="2.0.2"></a>
## [2.0.2](https://github.com/elbywan/wretch/compare/2.0.1...2.0.2) (2022-08-03)


### :bug: Bug fix(es)

* Fix defer and resolve return types. ([0c59c6c](https://github.com/elbywan/wretch/commit/0c59c6c)), closes [#140](https://github.com/elbywan/wretch/issues/140)



<a name="2.0.1"></a>
## [2.0.1](https://github.com/elbywan/wretch/compare/2.0.0...2.0.1) (2022-08-02)


### :arrow_up: Version update(s)

* Add unpkg field to map to the right bundle. ([ae87b64](https://github.com/elbywan/wretch/commit/ae87b64))
* Upgrade dependencies. ([b6a1258](https://github.com/elbywan/wretch/commit/b6a1258))

### :memo: Documentation update(s)

* Update cdn links. ([7571101](https://github.com/elbywan/wretch/commit/7571101))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/elbywan/wretch/compare/2.0.0-next.1...2.0.0) (2022-08-01)




<a name="2.0.0-next.1"></a>
# [2.0.0-next.1](https://github.com/elbywan/wretch/compare/1.7.10...2.0.0-next.1) (2022-07-08)


### :arrow_up: Version update(s)

* Bump packages ([5302d04](https://github.com/elbywan/wretch/commit/5302d04))

### :art: Code improvement(s)

* Add editorconfig ([e81eaff](https://github.com/elbywan/wretch/commit/e81eaff))
* Improved packaging and bundling ([69c1e35](https://github.com/elbywan/wretch/commit/69c1e35))

### :bug: Bug fix(es)

* Fix the jest resolver ([3a1f7b8](https://github.com/elbywan/wretch/commit/3a1f7b8))

### :docs: undefined

* Update readme and website ([2eb24dc](https://github.com/elbywan/wretch/commit/2eb24dc))

### :factory: New feature(s)

* Add error cause ([9a0a387](https://github.com/elbywan/wretch/commit/9a0a387)), closes [#98](https://github.com/elbywan/wretch/issues/98)
* Mark errors with a custom class ([211c902](https://github.com/elbywan/wretch/commit/211c902)), closes [#79](https://github.com/elbywan/wretch/issues/79)

### :fire: Breaking change(s)

* Add url arg and harmonize replace/mixin arguments ([8e4d0aa](https://github.com/elbywan/wretch/commit/8e4d0aa))
* Complete refactoring ([c2f5035](https://github.com/elbywan/wretch/commit/c2f5035))
* Drop support on node < 14 ([1ff926c](https://github.com/elbywan/wretch/commit/1ff926c))
* Restore normal array behaviour for formdata and fix tests ([6879d48](https://github.com/elbywan/wretch/commit/6879d48)), closes [#119](https://github.com/elbywan/wretch/issues/119)

### :memo: Documentation update(s)

* Additional improvements ([e79ff71](https://github.com/elbywan/wretch/commit/e79ff71))
* Autogenerate API documentation and split it from the main README ([c710a71](https://github.com/elbywan/wretch/commit/c710a71))
* Move svg asset and minor readme changes ([30de07c](https://github.com/elbywan/wretch/commit/30de07c))
* Regenerate api doc ([7ae5b57](https://github.com/elbywan/wretch/commit/7ae5b57))
* Small edits to the contributing file and renames scripts related t ([abec7f0](https://github.com/elbywan/wretch/commit/abec7f0))
* Update browserstack badge. ([91cad34](https://github.com/elbywan/wretch/commit/91cad34))
* Update bundle size ([1115d34](https://github.com/elbywan/wretch/commit/1115d34))
* Update companion website ([d6bb842](https://github.com/elbywan/wretch/commit/d6bb842))
* Update documentation ([15fd187](https://github.com/elbywan/wretch/commit/15fd187))

### :white_check_mark: Test improvement(s)

* Better tests coverage ([77e85dc](https://github.com/elbywan/wretch/commit/77e85dc))
* Fix resolvers test for node14 ([ca8b559](https://github.com/elbywan/wretch/commit/ca8b559))
* Fix test on node 18 (with polyfilled fetch) ([d3b7b00](https://github.com/elbywan/wretch/commit/d3b7b00))
* Replace restify with fastify for mock server ([9ee2cfc](https://github.com/elbywan/wretch/commit/9ee2cfc))
* Run lint on CI ([9b819d3](https://github.com/elbywan/wretch/commit/9b819d3))
* Test in multiple version of node in CI ([00d80a6](https://github.com/elbywan/wretch/commit/00d80a6))



<a name="1.7.10"></a>
## [1.7.10](https://github.com/elbywan/wretch/compare/1.7.9...1.7.10) (2022-05-21)


### :arrow_up: Version update(s)

* Bump minimist from 1.2.5 to 1.2.6 ([6365ad0](https://github.com/elbywan/wretch/commit/6365ad0))
* Bump moment from 2.24.0 to 2.29.2 ([26e3889](https://github.com/elbywan/wretch/commit/26e3889))
* Bump to npm 8 ([9d5758e](https://github.com/elbywan/wretch/commit/9d5758e))

### :bug: Bug fix(es)

* Ignore when the .perf promise throws ([33407ea](https://github.com/elbywan/wretch/commit/33407ea)), closes [#131](https://github.com/elbywan/wretch/issues/131)

### :memo: Documentation update(s)

* Update performance api node.js polyfill. ([185420b](https://github.com/elbywan/wretch/commit/185420b))

### :white_check_mark: Test improvement(s)

* Migrate to github actions. ([4b93f43](https://github.com/elbywan/wretch/commit/4b93f43))



<a name="1.7.9"></a>
## [1.7.9](https://github.com/elbywan/wretch/compare/1.7.8...1.7.9) (2022-02-05)


### :bug: Bug fix(es)

* Body json serialization condition fix. ([1c90fa3](https://github.com/elbywan/wretch/commit/1c90fa3)), closes [#123](https://github.com/elbywan/wretch/issues/123)



<a name="1.7.8"></a>
## [1.7.8](https://github.com/elbywan/wretch/compare/1.7.7...1.7.8) (2022-01-30)


### :arrow_up: Version update(s)

* Bump dependencies and npm audit. ([881d17a](https://github.com/elbywan/wretch/commit/881d17a))

### :bug: Bug fix(es)

* Fix error for opaque responses. ([bbb5912](https://github.com/elbywan/wretch/commit/bbb5912)), closes [#121](https://github.com/elbywan/wretch/issues/121)
* Preserve exotic json content types when strigifying body. ([d51c17b](https://github.com/elbywan/wretch/commit/d51c17b)), closes [#122](https://github.com/elbywan/wretch/issues/122)



<a name="1.7.7"></a>
## [1.7.7](https://github.com/elbywan/wretch/compare/1.7.6...1.7.7) (2021-12-13)


### :bug: Bug fix(es)

* Fix errorType argument type. ([5efd606](https://github.com/elbywan/wretch/commit/5efd606)), closes [#118](https://github.com/elbywan/wretch/issues/118)

### :memo: Documentation update(s)

* Update outdated badges. ([f286481](https://github.com/elbywan/wretch/commit/f286481))



<a name="1.7.6"></a>
## [1.7.6](https://github.com/elbywan/wretch/compare/1.7.5...1.7.6) (2021-08-06)


### :arrow_up: Version update(s)

* Upgrade dependencies. ([f62f977](https://github.com/elbywan/wretch/commit/f62f977))

### :bug: Bug fix(es)

* Prevent appending an extra ?/& for empty query strings. #114 ([15464a8](https://github.com/elbywan/wretch/commit/15464a8)), closes [#114](https://github.com/elbywan/wretch/issues/114)

### :memo: Documentation update(s)

* Update readme badges. ([b65878f](https://github.com/elbywan/wretch/commit/b65878f))



<a name="1.7.5"></a>
## [1.7.5](https://github.com/elbywan/wretch/compare/1.7.4...1.7.5) (2021-06-30)


### :arrow_up: Version update(s)

* Bump find-my-way from 2.2.1 to 2.2.5 ([687a999](https://github.com/elbywan/wretch/commit/687a999))
* Bump handlebars from 4.7.6 to 4.7.7 ([0cb2ac2](https://github.com/elbywan/wretch/commit/0cb2ac2))
* Bump hosted-git-info from 2.8.8 to 2.8.9 ([c862315](https://github.com/elbywan/wretch/commit/c862315))
* Bump ini from 1.3.5 to 1.3.7 ([79fd31f](https://github.com/elbywan/wretch/commit/79fd31f))
* Bump lodash from 4.17.19 to 4.17.21 ([fe66a14](https://github.com/elbywan/wretch/commit/fe66a14))
* Bump node-notifier from 8.0.0 to 8.0.1 ([43cd685](https://github.com/elbywan/wretch/commit/43cd685))
* Bump ws from 7.3.1 to 7.4.6 ([d0f89f1](https://github.com/elbywan/wretch/commit/d0f89f1))
* Bump y18n from 4.0.0 to 4.0.1 ([6d0fbdc](https://github.com/elbywan/wretch/commit/6d0fbdc))
* Upgrade dependencies. ([805fade](https://github.com/elbywan/wretch/commit/805fade))

### :bug: Bug fix(es)

* Take into account the options argument headers when stringifying bo ([23484fd](https://github.com/elbywan/wretch/commit/23484fd)), closes [#75](https://github.com/elbywan/wretch/issues/75)

### :memo: Documentation update(s)

* Update readme import section ([5970e6d](https://github.com/elbywan/wretch/commit/5970e6d))



<a name="1.7.4"></a>
## [1.7.4](https://github.com/elbywan/wretch/compare/1.7.3...1.7.4) (2020-10-14)


### :bug: Bug fix(es)

* Fix post with overloaded json content-type charset. ([af48887](https://github.com/elbywan/wretch/commit/af48887))

### :memo: Documentation update(s)

*  Update package size approximation. ([2399419](https://github.com/elbywan/wretch/commit/2399419))



<a name="1.7.3"></a>
## [1.7.3](https://github.com/elbywan/wretch/compare/1.7.2...1.7.3) (2020-10-12)


### :arrow_up: Version update(s)

* Bump lodash from 4.17.14 to 4.17.19 ([c5c255f](https://github.com/elbywan/wretch/commit/c5c255f))
* Bump node-fetch from 2.6.0 to 2.6.1 ([d536ba5](https://github.com/elbywan/wretch/commit/d536ba5))
* Upgrade dependencies ([0bb3235](https://github.com/elbywan/wretch/commit/0bb3235))

### :bug: Bug fix(es)

* Allow custom charset with json body. ([52d2caa](https://github.com/elbywan/wretch/commit/52d2caa)), closes [#90](https://github.com/elbywan/wretch/issues/90)

### :memo: Documentation update(s)

* Fix readme arry typo. ([b465a4f](https://github.com/elbywan/wretch/commit/b465a4f))
* Fix readme bad chars. ([12b7231](https://github.com/elbywan/wretch/commit/12b7231))
* Mention Deno in the readme. ([b52847a](https://github.com/elbywan/wretch/commit/b52847a))



<a name="1.7.2"></a>
## [1.7.2](https://github.com/elbywan/wretch/compare/1.7.1...1.7.2) (2020-04-13)


### :arrow_up: Version update(s)

* Bump acorn from 6.4.0 to 6.4.1 ([24bc906](https://github.com/elbywan/wretch/commit/24bc906))
* Upgrade dependencies ([76b32fd](https://github.com/elbywan/wretch/commit/76b32fd))

### :bug: Bug fix(es)

* Prevent overriding content-type when passing body in http methods.  ([f6f9302](https://github.com/elbywan/wretch/commit/f6f9302)), closes [#75](https://github.com/elbywan/wretch/issues/75)



<a name="1.7.1"></a>
## [1.7.1](https://github.com/elbywan/wretch/compare/1.7.0...1.7.1) (2020-01-25)


### :bug: Bug fix(es)

* Fix crash on nested null formdata value. #68 ([9c1adf0](https://github.com/elbywan/wretch/commit/9c1adf0)), closes [#68](https://github.com/elbywan/wretch/issues/68)

### :memo: Documentation update(s)

* Update broken readme link. ([e115c63](https://github.com/elbywan/wretch/commit/e115c63))



<a name="1.7.0"></a>
# [1.7.0](https://github.com/elbywan/wretch/compare/1.6.0...1.7.0) (2020-01-25)


### :arrow_up: Version update(s)

* Upgrade packages ([a68d94e](https://github.com/elbywan/wretch/commit/a68d94e))

### :factory: New feature(s)

* Support nested objects in formData. #68 ([90d9555](https://github.com/elbywan/wretch/commit/90d9555)), closes [#68](https://github.com/elbywan/wretch/issues/68)



<a name="1.6.0"></a>
# [1.6.0](https://github.com/elbywan/wretch/compare/1.5.5...1.6.0) (2019-11-27)


### :factory: New feature(s)

* Add esm bundle. #63 ([9655b46](https://github.com/elbywan/wretch/commit/9655b46)), closes [#63](https://github.com/elbywan/wretch/issues/63)
* Add fetch error catcher. #62 ([96a147c](https://github.com/elbywan/wretch/commit/96a147c)), closes [#62](https://github.com/elbywan/wretch/issues/62)



<a name="1.5.5"></a>
## [1.5.5](https://github.com/elbywan/wretch/compare/1.5.4...1.5.5) (2019-10-15)


### :arrow_up: Version update(s)

* Upgrade packages ([05c0b9e](https://github.com/elbywan/wretch/commit/05c0b9e))

### :bug: Bug fix(es)

* Fix handling falsey values for body callback and payload. ([2d99a4f](https://github.com/elbywan/wretch/commit/2d99a4f)), closes [#58](https://github.com/elbywan/wretch/issues/58)

### :memo: Documentation update(s)

* Update readme browserstack badge. ([eddfd91](https://github.com/elbywan/wretch/commit/eddfd91))

### :white_check_mark: Test improvement(s)

* Restore latest browserstack matrix and add an exceptio ([ef09fd8](https://github.com/elbywan/wretch/commit/ef09fd8))
* Use macos firefox on browserstack ([e51048e](https://github.com/elbywan/wretch/commit/e51048e))



<a name="1.5.4"></a>
## [1.5.4](https://github.com/elbywan/wretch/compare/1.5.3...1.5.4) (2019-07-16)


### :arrow_up: Version update(s)

* Upgrade packages to fix vulnerabilities. ([dced4c1](https://github.com/elbywan/wretch/commit/dced4c1))

### :memo: Documentation update(s)

* Fix readme opts link ([5595ef7](https://github.com/elbywan/wretch/commit/5595ef7))

### :white_check_mark: Test improvement(s)

* Add missing browser test ([2f5498c](https://github.com/elbywan/wretch/commit/2f5498c))
* Add missing browser tests ([9bd7e4f](https://github.com/elbywan/wretch/commit/9bd7e4f))
* Fix browserstack browser & os matrix. ([451ef23](https://github.com/elbywan/wretch/commit/451ef23))



<a name="1.5.3"></a>
## [1.5.3](https://github.com/elbywan/wretch/compare/1.5.2...1.5.3) (2019-07-11)


### :arrow_up: Version update(s)

* Upgrade dependencies ([5e77291](https://github.com/elbywan/wretch/commit/5e77291))

### :bug: Bug fix(es)

* Preserve headers on null/undefined argument ([9e3fe0a](https://github.com/elbywan/wretch/commit/9e3fe0a)), closes [#52](https://github.com/elbywan/wretch/issues/52)



<a name="1.5.2"></a>
## [1.5.2](https://github.com/elbywan/wretch/compare/1.5.1...1.5.2) (2019-04-28)


### :bug: Bug fix(es)

* Clear pending timeout when request resolves / fails ([687570b](https://github.com/elbywan/wretch/commit/687570b)), closes [#50](https://github.com/elbywan/wretch/issues/50)

### :memo: Documentation update(s)

* Add 1.5.1 changelog ([fd4386c](https://github.com/elbywan/wretch/commit/fd4386c))
* Fix .catcher documentation typo. ([2b98d6b](https://github.com/elbywan/wretch/commit/2b98d6b))
* Remove bad usage of .error in the readme ([a5209d0](https://github.com/elbywan/wretch/commit/a5209d0))



<a name="1.5.1"></a>
## [1.5.1](https://github.com/elbywan/wretch/compare/1.5.0...1.5.1) (2019-03-17)


### :arrow_up: Version update(s)

* Upgrade rollup dep ([d890b8a](https://github.com/elbywan/wretch/commit/d890b8a))

### :bug: Bug fix(es)

* Fix mutating catchers propagation to cloned wretchers ([d207027](https://github.com/elbywan/wretch/commit/d207027)), closes [#44](https://github.com/elbywan/wretch/issues/44)

### :memo: Documentation update(s)

* Add the concept of middleware context to the readme. ([50a78c5](https://github.com/elbywan/wretch/commit/50a78c5))
* Change package kb size displayed in the html ([b3ebb78](https://github.com/elbywan/wretch/commit/b3ebb78))

### :white_check_mark: Test improvement(s)

* CI build on node.js LTS ([90290ab](https://github.com/elbywan/wretch/commit/90290ab))
* Test form-data with streams. ([92af63a](https://github.com/elbywan/wretch/commit/92af63a))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/elbywan/wretch/compare/1.4.2...1.5.0) (2019-02-23)


### :arrow_up: Version update(s)

* Upgrade dependencies and fix package version in lock file ([b17d10a](https://github.com/elbywan/wretch/commit/b17d10a))
* Upgrade jest and rollup ([0573f7a](https://github.com/elbywan/wretch/commit/0573f7a))

### :art: Code improvement(s)

* Add inline source maps ([03ca27e](https://github.com/elbywan/wretch/commit/03ca27e))

### :factory: New feature(s)

* Add a replay() method. ([5af4ecc](https://github.com/elbywan/wretch/commit/5af4ecc)), closes [#35](https://github.com/elbywan/wretch/issues/35)

### :memo: Documentation update(s)

* More details about the response types in the readme ([270fe16](https://github.com/elbywan/wretch/commit/270fe16))



<a name="1.4.2"></a>
## [1.4.2](https://github.com/elbywan/wretch/compare/1.4.1...1.4.2) (2018-10-21)


### :arrow_up: Version update(s)

* Upgrade packages ([268565d](https://github.com/elbywan/wretch/commit/268565d))

### :art: Code improvement(s)

* Export typedefs at the root level ([d2bcb13](https://github.com/elbywan/wretch/commit/d2bcb13))

### :memo: Documentation update(s)

* Fix readme typo ([78b7a2b](https://github.com/elbywan/wretch/commit/78b7a2b))
* Update .query documentation ([03c5cbe](https://github.com/elbywan/wretch/commit/03c5cbe))

### :white_check_mark: Test improvement(s)

* Improve performance timings test coverage ([c4db506](https://github.com/elbywan/wretch/commit/c4db506))



<a name="1.4.1"></a>
## [1.4.1](https://github.com/elbywan/wretch/compare/1.4.0...1.4.1) (2018-08-13)


### :arrow_up: Version update(s)

* 1.4.1 tag ([429fd8d](https://github.com/elbywan/wretch/commit/429fd8d))
* Upgrade devDeps ([0a6c223](https://github.com/elbywan/wretch/commit/0a6c223))

### :art: Code improvement(s)

* Improve typedefs ([232c063](https://github.com/elbywan/wretch/commit/232c063))

### :bug: Bug fix(es)

* Add default errorType to response object ([c134efa](https://github.com/elbywan/wretch/commit/c134efa))

### :white_check_mark: Test improvement(s)

* Improve unit tests to check default error type ([3f1bb4b](https://github.com/elbywan/wretch/commit/3f1bb4b)), closes [#c134](https://github.com/elbywan/wretch/issues/c134)
* Prevent running browserstack on PRs ([c350060](https://github.com/elbywan/wretch/commit/c350060))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/elbywan/wretch/compare/1.3.1...1.4.0) (2018-07-10)


### :arrow_up: Version update(s)

* 1.4.0 tag ([27acc8e](https://github.com/elbywan/wretch/commit/27acc8e))

### :fire: Breaking change(s)

* Make .formUrl encode arrays in a standard way ([f04c9af](https://github.com/elbywan/wretch/commit/f04c9af)), closes [#26](https://github.com/elbywan/wretch/issues/26)



<a name="1.3.1"></a>
## [1.3.1](https://github.com/elbywan/wretch/compare/1.3.0...1.3.1) (2018-06-12)


### :arrow_up: Version update(s)

* 1.3.1 tag ([f162e0e](https://github.com/elbywan/wretch/commit/f162e0e))

### :art: Code improvement(s)

* Launch the mock server aside of the test file. ([35c5a4e](https://github.com/elbywan/wretch/commit/35c5a4e))

### :memo: Documentation update(s)

* Add bundlephobia badge. ([0399a65](https://github.com/elbywan/wretch/commit/0399a65))
* Add paypal badge ([cd98e4d](https://github.com/elbywan/wretch/commit/cd98e4d))
* Fix broken readme links. ([75f767d](https://github.com/elbywan/wretch/commit/75f767d))
* Mention browserstack in the readme. ([2f6ad8e](https://github.com/elbywan/wretch/commit/2f6ad8e))
* Update readme package version ([04f75ce](https://github.com/elbywan/wretch/commit/04f75ce))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/elbywan/wretch/compare/1.2.0...1.3.0) (2018-06-09)


### :arrow_up: Version update(s)

* 1.3.0 tag ([ff05dfc](https://github.com/elbywan/wretch/commit/ff05dfc))

### :bug: Bug fix(es)

* Fix .url call when the url contains query parameters ([e68764f](https://github.com/elbywan/wretch/commit/e68764f))

### :factory: New feature(s)

* Add deferred callback chain. ([10ddfe5](https://github.com/elbywan/wretch/commit/10ddfe5))

### :fire: Breaking change(s)

* Add body argument shorthand to the http methods. ([103cde3](https://github.com/elbywan/wretch/commit/103cde3))

### :memo: Documentation update(s)

* Mention the wretch-middlewares package in the readme ([880c02c](https://github.com/elbywan/wretch/commit/880c02c))
* Update .query anchor ([b2670d9](https://github.com/elbywan/wretch/commit/b2670d9))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/elbywan/wretch/compare/1.1.2...1.2.0) (2018-05-24)


### :arrow_up: Version update(s)

* 1.2.0 tag ([3f067df](https://github.com/elbywan/wretch/commit/3f067df))

### :factory: New feature(s)

* Accept string argument in .query() #20 ([b53cca3](https://github.com/elbywan/wretch/commit/b53cca3)), closes [#20](https://github.com/elbywan/wretch/issues/20)

### :fire: Breaking change(s)

* Make .query() chainable #20 ([1a6a7c8](https://github.com/elbywan/wretch/commit/1a6a7c8)), closes [#20](https://github.com/elbywan/wretch/issues/20)

### :white_check_mark: Test improvement(s)

* Add more node.js versions used by the travis CI ([7d6d779](https://github.com/elbywan/wretch/commit/7d6d779))
* Fixes for node.js v10 ([0dcba96](https://github.com/elbywan/wretch/commit/0dcba96))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/elbywan/wretch/compare/1.1.1...1.1.2) (2018-03-07)


### :arrow_up: Version update(s)

* 1.1.2 tag ([f4e9ffe](https://github.com/elbywan/wretch/commit/f4e9ffe))

### :art: Code improvement(s)

* Relaxed Response & Options types ([16c0b97](https://github.com/elbywan/wretch/commit/16c0b97))

### :white_check_mark: Test improvement(s)

* Update tests with a working abortController polyfill ([171ac48](https://github.com/elbywan/wretch/commit/171ac48))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/elbywan/wretch/compare/1.1.0...1.1.1) (2018-01-08)


### :arrow_up: Version update(s)

* 1.1.1 tag ([efc67a4](https://github.com/elbywan/wretch/commit/efc67a4))

### :art: Code improvement(s)

* Remove typo ([7883219](https://github.com/elbywan/wretch/commit/7883219))

### :factory: New feature(s)

* Pass the original request to the catchers/resolvers callback ([1e4d3a4](https://github.com/elbywan/wretch/commit/1e4d3a4))

### :memo: Documentation update(s)

* Update middleware and intro ([09b0dc1](https://github.com/elbywan/wretch/commit/09b0dc1))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/elbywan/wretch/compare/1.0.0...1.1.0) (2017-11-17)


### :arrow_up: Version update(s)

* 1.1.0 tag ([75e0c68](https://github.com/elbywan/wretch/commit/75e0c68))

### :art: Code improvement(s)

* Comply with the commonjs typescript transpilation (#10) ([6931ff6](https://github.com/elbywan/wretch/commit/6931ff6)), closes [#10](https://github.com/elbywan/wretch/issues/10)
* Refactor method function call ([cf07316](https://github.com/elbywan/wretch/commit/cf07316))
* Remove irregular whitespace ([7bc2990](https://github.com/elbywan/wretch/commit/7bc2990))

### :bug: Bug fix(es)

* Fix es6 const generated by rollup typescript helpers ([6791721](https://github.com/elbywan/wretch/commit/6791721)), closes [#11](https://github.com/elbywan/wretch/issues/11)

### :factory: New feature(s)

* Add middlewares helper. (#12) ([b9c6a65](https://github.com/elbywan/wretch/commit/b9c6a65)), closes [#12](https://github.com/elbywan/wretch/issues/12)

### :memo: Documentation update(s)

* Adding middlewares code samples (#12). ([b43cb1b](https://github.com/elbywan/wretch/commit/b43cb1b)), closes [#12](https://github.com/elbywan/wretch/issues/12)
* Update npm badge color ([0eae7bb](https://github.com/elbywan/wretch/commit/0eae7bb))
* Update readme top message and remove experimental flag for abortin ([e449b46](https://github.com/elbywan/wretch/commit/e449b46))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/elbywan/wretch/compare/0.3.1...1.0.0) (2017-10-20)


### :arrow_up: Version update(s)

* 1.0.0 tag ([63b7d2b](https://github.com/elbywan/wretch/commit/63b7d2b))

### :art: Code improvement(s)

* Widen resolver return type ([6e2b299](https://github.com/elbywan/wretch/commit/6e2b299))

### :factory: New feature(s)

* Add auth method to set the Authorization header. ([1694396](https://github.com/elbywan/wretch/commit/1694396))
* Add early resolvers with the resolve function ([481803b](https://github.com/elbywan/wretch/commit/481803b))
* Add HEAD and OPTIONS http methods. ([3c30844](https://github.com/elbywan/wretch/commit/3c30844))

### :memo: Documentation update(s)

* Add homepage usage section, tagboxes and footer ([fd3bcf7](https://github.com/elbywan/wretch/commit/fd3bcf7))
* Bypass jekyll ([22c957c](https://github.com/elbywan/wretch/commit/22c957c))
* Fix readme typo ([9d1b4c6](https://github.com/elbywan/wretch/commit/9d1b4c6))
* Readme modifications : fix method links, simplify polyfills, add h ([e37ea0b](https://github.com/elbywan/wretch/commit/e37ea0b))

### :white_check_mark: Test improvement(s)

* Migrate from mocha to jest ([f67bd84](https://github.com/elbywan/wretch/commit/f67bd84))



<a name="0.3.1"></a>
## [0.3.1](https://github.com/elbywan/wretch/compare/0.3.0...0.3.1) (2017-10-09)


### :arrow_up: Version update(s)

* 0.3.1 tag ([ccca2dc](https://github.com/elbywan/wretch/commit/ccca2dc))

### :memo: Documentation update(s)

* Add homepage in package.json ([c78a5dd](https://github.com/elbywan/wretch/commit/c78a5dd))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/elbywan/wretch/compare/0.2.4...0.3.0) (2017-10-09)


### :arrow_up: Version update(s)

* 0.3.0 tag ([a9450c1](https://github.com/elbywan/wretch/commit/a9450c1))

### :art: Code improvement(s)

* Add polyfill getter method ([ca49cfc](https://github.com/elbywan/wretch/commit/ca49cfc))
* Can now catch on error name ([2a0f7e9](https://github.com/elbywan/wretch/commit/2a0f7e9))

### :checkered_flag: Performance update(s)

* Refactor perfs() to improve robustness and performance ([7b2b27c](https://github.com/elbywan/wretch/commit/7b2b27c))

### :factory: New feature(s)

* Abortable requests ([c5888fe](https://github.com/elbywan/wretch/commit/c5888fe)), closes [#7](https://github.com/elbywan/wretch/issues/7)
* Add formUrl body type ([64f6c3e](https://github.com/elbywan/wretch/commit/64f6c3e)), closes [#9](https://github.com/elbywan/wretch/issues/9)

### :fire: Breaking change(s)

*  The .options function now mixin by default ([47b4630](https://github.com/elbywan/wretch/commit/47b4630))
* Remove .baseUrl and change .url behaviour ([5142b02](https://github.com/elbywan/wretch/commit/5142b02)), closes [#8](https://github.com/elbywan/wretch/issues/8)

### :memo: Documentation update(s)

* Add methods indexes and clarify some point in the readme ([54dae1c](https://github.com/elbywan/wretch/commit/54dae1c))
* Add minimalist companion website. ([10f2197](https://github.com/elbywan/wretch/commit/10f2197))
* Add readme announcement. ([d87a57d](https://github.com/elbywan/wretch/commit/d87a57d))
* Fix readme typo ([85852a6](https://github.com/elbywan/wretch/commit/85852a6))
* Fixed readme usage layout ([7f8ea0f](https://github.com/elbywan/wretch/commit/7f8ea0f))
* Update readme ([7881e2c](https://github.com/elbywan/wretch/commit/7881e2c))



<a name="0.2.4"></a>
## [0.2.4](https://github.com/elbywan/wretch/compare/0.2.3...0.2.4) (2017-10-06)


### :arrow_up: Version update(s)

* 0.2.4 tag ([879e14a](https://github.com/elbywan/wretch/commit/879e14a))

### :bug: Bug fix(es)

* Fix perfs() concurrency issues ([79f86ce](https://github.com/elbywan/wretch/commit/79f86ce))



<a name="0.2.3"></a>
## [0.2.3](https://github.com/elbywan/wretch/compare/0.2.2...0.2.3) (2017-10-06)


### :arrow_up: Version update(s)

* 0.2.3 tag ([cce504c](https://github.com/elbywan/wretch/commit/cce504c))

### :art: Code improvement(s)

* Add module field in package.json ([90431ff](https://github.com/elbywan/wretch/commit/90431ff))
* Add node.js partial support to the perf function ([0045672](https://github.com/elbywan/wretch/commit/0045672))
* Hide the changelog preset beneath a scripts folder + rewrite ([696503c](https://github.com/elbywan/wretch/commit/696503c))

### :factory: New feature(s)

* Highly experimental perfs function. ([6fa1d29](https://github.com/elbywan/wretch/commit/6fa1d29))

### :memo: Documentation update(s)

* Correct errorType typo ([e058b7a](https://github.com/elbywan/wretch/commit/e058b7a))
* Fix contributing typo ([d12e29c](https://github.com/elbywan/wretch/commit/d12e29c))
* Perfs() documentation ([6c90e15](https://github.com/elbywan/wretch/commit/6c90e15))
* Readme : image cdn and shorten unpkg link ([8eac8c9](https://github.com/elbywan/wretch/commit/8eac8c9))

### :white_check_mark: Test improvement(s)

* Write perfs() tests ([3a14499](https://github.com/elbywan/wretch/commit/3a14499))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/elbywan/wretch/compare/0.2.1...0.2.2) (2017-10-04)


### :arrow_up: Version update(s)

* 0.2.2 tag ([0883134](https://github.com/elbywan/wretch/commit/0883134))

### :art: Code improvement(s)

* Moves polyfills to the config object ([2820e34](https://github.com/elbywan/wretch/commit/2820e34))

### :factory: New feature(s)

* Allow non-global fetch & FormData ([112b9cc](https://github.com/elbywan/wretch/commit/112b9cc))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/elbywan/wretch/compare/0.2.0...0.2.1) (2017-10-03)


### :arrow_up: Version update(s)

* 0.2.1 tag ([d13e8ad](https://github.com/elbywan/wretch/commit/d13e8ad))

### :art: Code improvement(s)

* Add custom changelog preset ([023a73c](https://github.com/elbywan/wretch/commit/023a73c))
* change changelog format to atom ([970bf7b](https://github.com/elbywan/wretch/commit/970bf7b))

### :bug: Bug fix(es)

* Fix baseUrl not mixing in options ([5c90df4](https://github.com/elbywan/wretch/commit/5c90df4))

### :memo: Documentation update(s)

* Add badges ([d29c96d](https://github.com/elbywan/wretch/commit/d29c96d))
* Regenerate changelog ([c14ede7](https://github.com/elbywan/wretch/commit/c14ede7))
* Update contributing guidelines ([b96022d](https://github.com/elbywan/wretch/commit/b96022d))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/elbywan/wretch/compare/0.1.5...0.2.0) (2017-10-03)


### :arrow_up: Version update(s)

* 0.2.0 tag ([d903c48](https://github.com/elbywan/wretch/commit/d903c48))

### :fire: Breaking change(s)

* :art: Replace mixdefaults with a mixin flag. ([c497f6e](https://github.com/elbywan/wretch/commit/c497f6e))

### :memo: Documentation update(s)

* Create CONTRIBUTING.md ([c79578a](https://github.com/elbywan/wretch/commit/c79578a))
* Update readme with unpkg ([1131755](https://github.com/elbywan/wretch/commit/1131755))
* Update README.md ([b8f3cc8](https://github.com/elbywan/wretch/commit/b8f3cc8))



<a name="0.1.5"></a>
## [0.1.5](https://github.com/elbywan/wretch/compare/0.1.4...0.1.5) (2017-10-03)


### :arrow_up: Version update(s)

* 0.1.5 tag ([6551424](https://github.com/elbywan/wretch/commit/6551424))

### :art: Code improvement(s)

* Update changelog ([7717052](https://github.com/elbywan/wretch/commit/7717052))

### :checkered_flag: Performance update(s)

* Use a Map instead of an Array for catchers ([dba8e63](https://github.com/elbywan/wretch/commit/dba8e63))



<a name="0.1.4"></a>
## [0.1.4](https://github.com/elbywan/wretch/compare/0.1.3...0.1.4) (2017-10-03)


### :art: Code improvement(s)

* Better changelog ([d4ae365](https://github.com/elbywan/wretch/commit/d4ae365))

### :checkered_flag: Performance update(s)

* [mix] small perf improvements ([fb319eb](https://github.com/elbywan/wretch/commit/fb319eb))

### :factory: New feature(s)

* Add changelog ([457852d](https://github.com/elbywan/wretch/commit/457852d))
* Add global catchers with the catcher method ([04b5cb9](https://github.com/elbywan/wretch/commit/04b5cb9))

### :memo: Documentation update(s)

* Fix typos ([ad0d612](https://github.com/elbywan/wretch/commit/ad0d612))
* Fix typos ([6b074dc](https://github.com/elbywan/wretch/commit/6b074dc))
* Update README.md ([ff48732](https://github.com/elbywan/wretch/commit/ff48732))



<a name="0.1.3"></a>
## [0.1.3](https://github.com/elbywan/wretch/compare/0.1.2...0.1.3) (2017-10-03)


### :arrow_up: Version update(s)

* 0.1.3 tag ([c8ad85e](https://github.com/elbywan/wretch/commit/c8ad85e))
* Update deps ([aec23f0](https://github.com/elbywan/wretch/commit/aec23f0))

### :art: Code improvement(s)

* Add gitattributes ([45329a4](https://github.com/elbywan/wretch/commit/45329a4))
* Add tslint ([0078004](https://github.com/elbywan/wretch/commit/0078004))
* Code split ([d3e725a](https://github.com/elbywan/wretch/commit/d3e725a))
* Update .gitattributes ([52eebb1](https://github.com/elbywan/wretch/commit/52eebb1))

### :bug: Bug fix(es)

* Fix typos in mergeArrays ([966cbeb](https://github.com/elbywan/wretch/commit/966cbeb))

### :factory: New feature(s)

* Add headers/content/body methods and better options type. ([3c9c10e](https://github.com/elbywan/wretch/commit/3c9c10e))

### :memo: Documentation update(s)

* Clearer README ([4579bb6](https://github.com/elbywan/wretch/commit/4579bb6))
* Update README.md ([743b7d5](https://github.com/elbywan/wretch/commit/743b7d5))
* Update README.md ([11094dd](https://github.com/elbywan/wretch/commit/11094dd))
* Update README.md ([9bc38dd](https://github.com/elbywan/wretch/commit/9bc38dd))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/elbywan/wretch/compare/0.1.1...0.1.2) (2017-10-03)


### :arrow_up: Version update(s)

* 0.1.2 tag ([eb3a094](https://github.com/elbywan/wretch/commit/eb3a094))

### :art: Code improvement(s)

* Correct types ([f6aeb64](https://github.com/elbywan/wretch/commit/f6aeb64))
* Improve typescript definitions ([b8d4e96](https://github.com/elbywan/wretch/commit/b8d4e96))

### :factory: New feature(s)

* Add baseUrl ([a0107c9](https://github.com/elbywan/wretch/commit/a0107c9)), closes [#2](https://github.com/elbywan/wretch/issues/2)

### :memo: Documentation update(s)

* Readme update ([e2e3522](https://github.com/elbywan/wretch/commit/e2e3522))
* Readme update ([3cb3b23](https://github.com/elbywan/wretch/commit/3cb3b23))
* Typo fix ([6a06919](https://github.com/elbywan/wretch/commit/6a06919))
* Update README.md ([ae0c9c0](https://github.com/elbywan/wretch/commit/ae0c9c0))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/elbywan/wretch/compare/0.1.0...0.1.1) (2017-10-03)


### :arrow_up: Version update(s)

* 0.1.1 tag ([f054836](https://github.com/elbywan/wretch/commit/f054836))

### :art: Code improvement(s)

* Correct optional callbacks in declaration files ([0b37983](https://github.com/elbywan/wretch/commit/0b37983))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/elbywan/wretch/compare/0.0.1...0.1.0) (2017-10-03)


### :arrow_up: Version update(s)

* 0.1.0 tag ([2d161d6](https://github.com/elbywan/wretch/commit/2d161d6))

### :art: Code improvement(s)

* Add coverage ([517ee5d](https://github.com/elbywan/wretch/commit/517ee5d))
* Move from webpack to rollup and restore source maps ([6515d7a](https://github.com/elbywan/wretch/commit/6515d7a))

### :fire: Breaking change(s)

* Remove source maps ([338f080](https://github.com/elbywan/wretch/commit/338f080))

### :memo: Documentation update(s)

* Add documentation ([5cae7f3](https://github.com/elbywan/wretch/commit/5cae7f3))

### :white_check_mark: Test improvement(s)

* Improve coverage ([5b10a93](https://github.com/elbywan/wretch/commit/5b10a93))



<a name="0.0.1"></a>
## [0.0.1](https://github.com/elbywan/wretch/compare/ac4ae15...0.0.1) (2017-10-03)


### :arrow_up: Version update(s)

* 0.0.1 tag ([4d6eeed](https://github.com/elbywan/wretch/commit/4d6eeed))

### :factory: New feature(s)

* init ([ac4ae15](https://github.com/elbywan/wretch/commit/ac4ae15))



