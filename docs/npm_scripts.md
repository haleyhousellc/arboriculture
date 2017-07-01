# Package Scripts

This wiki page provides details on the complete list of npm scripts include in the package.

### Linting

---

```bash
npm run lint
```

This script checks the Typescript source against the set of rules outlined in 
[tslint.json](https://github.com/haleyga/arboriculture/blob/master/tslint.json)
<br><br>

### Building

---

```bash
npm run build
```
This script with compile the TypeScript source to ES6-compatible JavaScript.  Subsequent calls to `transpile` and
`uglify` complete the process by transpiling to ES5-compatible JavaScript and performing comprehensive minification.
<br><br>

##### prebuild

*Note: this step does not need to be run manually*

```bash
npm run prebuild
```
This simply prepares the build environment by running `clean:dist`.
<br><br>

##### postbuild

*Note: this step does not need to be run manually*

```bash
npm run postbuild
```
This script continues the build process by calling `transpile`.
<br><br>

### Compiling

---

##### Compiling the TypeScript source

```bash
npm run compile:source
```
This script compiles the TypeScript files in the `src` directory (excluding `*.spec.ts`).
<br><br>

##### Compiling the Mocha/Chai tests

```bash
npm run compile:tests
```
This script compiles the TypeScript `*.spec.ts` files in the `src` directory.
<br><br>

##### Compiling the TypeScript examples

```bash
npm run compile:examples
```
This script compiles the TypeScript examples in the `examples` directory.
<br><br>

### Documenting

---

```bash
npm run doc
```
This will generate html documentation for the TypeScript source code via the 
[typedoc](https://github.com/TypeStrong/typedoc) tool.
<br><br>

##### predoc

*Note: this step does not need to be run manually*

```bash
npm run prebuild
```
This simply prepares the doc environment by running `clean:docs`.
<br><br>

### Cleaning

---

```bash
npm run clean
```
A full clean will run each of the individual cleans below and completely resets the directory structure.
<br><br>

##### Clean `src` folder

```bash
npm run clean:src
```
This will clean any residual `*.js` and `*.js.map` files generated from other scripts.
<br><br>

##### Clean `dist` folder

```bash
npm run clean:dist
```
This will completely remove the `dist` folder containing compiled and transpiled code ready for distribution.
<br><br>

##### Clean `docs` folder

```bash
npm run clean:docs
```
This will remove the documentation generated with the `doc` script under the `docs/autogen` directory.
<br><br>

##### Clean `examples` folder

```bash
npm run clean:examples
```
This will clean any residual `*.js` and `*.js.map` files generated from the `compile:examples` script.
<br><br>

##### Clean miscellaneous items

```bash
npm run clean:misc
```
This will remove `index.d.ts`, `index.js`, `index.js.map`, and any `npm-debug.log` that might have been generated.
<br><br>

### Testing

---

```bash
npm run test
```
This script will run all Mocha/Chai tests in the project.
<br><br>

### Transpiling

---

```bash
npm run transpile
```
This script will transpile the compiled ES6-compatible JavaScript in `dist/es6` to ES5-JavaScript and place the results
in `dist/es5`.

*Note: this command does not need to be run directly since it is chained after the `build` script.*

*Note: for those running this command directly, it assumes a `dist/es6` directory exists and will transpile any
 JavaScript that resides there.*
<br><br>

##### pretranspile

*Note: this step does not need to be run manually*

```bash
npm run pretranspile
```
This simply cleans the `dist/es5` directory.
<br><br>

##### posttranspile

*Note: this step does not need to be run manually*

```bash
npm run posttranspile
```
This script continues the build chain by calling `uglify`.
<br><br>

### Uglifying

---

```bash
npm run uglify
```
This script readies the JavaScript in `dist/es5` for deployment.  It concatenates, compresses, mangles, and uglifies the
code into an efficiently deployable product.

*Note: this command does not need to be run directly since it is chained after the `transpile` script.*

*Note: for those running this command directly, it assumes a `dist/es5` directory exists and will process any JavaScript
 that resides there.*
<br><br>

##### preuglify

*Note: this step does not need to be run manually*

```bash
npm run preuglify
```
This simply removes any existing deployable product.
<br><br>

###

---

```bash
npm run thewholenine
```
This script will perform a complete pre-deployment workup (except auto-generated documentation).  It runs `lint`, 
`build` (including `transpile` and `uglify`), `test`, and then `securitycheck`.

*Note: this script does not run `doc` because that command will generate links to the most recent GitHub commit.  If no
 changes have been made to the code, links will be correct.  However, if you are checking code in after this build, wait
 generate docs until after the push is accepted.*
 <br><br>
 
##### prethewholenine

*Note: this step does not need to be run manually*

```bash
npm run prethwholenine
```
This simply cleans the environment with `clean`.
<br><br>

### Miscellaneous

---

##### Security Check

```bash
npm run securitycheck
```
This script will run Node Security's [nsp](https://github.com/nodesecurity/nsp) tool to search for common security 
vulnerabilities in your code.
<br><br>
