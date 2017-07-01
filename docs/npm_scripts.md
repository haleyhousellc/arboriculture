# Package Scripts

This wiki page provides details on the complete list of npm scripts include in the package.

### Linting <a id="linting"></a>

---

```bash
npm run lint
```

This script checks the Typescript source against the set of rules outlined in 
[tslint.json](https://github.com/haleyga/arboriculture/blob/master/tslint.json)
<br><br>

### Building <a id="building"></a>

---

```bash
npm run build
```
This script with compile the TypeScript source to ES6-compatible JavaScript.  Subsequent calls to 
[`transpile`](#transpiling) and [`uglify`](#uglifying) complete the process by transpiling to ES5-compatible JavaScript
and performing comprehensive minification.
<br><br>

##### prebuild <a id="prebuild"></a>

*Note: this step does not need to be run manually*

```bash
npm run prebuild
```
This simply prepares the build environment by running [`clean:dist`](#clean-dist).
<br><br>

##### postbuild <a id="postbuild"></a>

*Note: this step does not need to be run manually*

```bash
npm run postbuild
```
This script continues the build process by calling [`transpile`](#transpiling).
<br><br>

### Compiling <a id="compiling"></a>

---

##### Compiling the TypeScript source <a id="compile-source"></a>

```bash
npm run compile:source
```
This script compiles the TypeScript files in the 
[`src`](ttps://github.com/haleyga/arboriculture/blob/master/src) directory (excluding `*.spec.ts`).
<br><br>

##### Compiling the Mocha/Chai tests <a id="compile-tests"></a>

```bash
npm run compile:tests
```
This script compiles the TypeScript `*.spec.ts` files in the 
[`src`](ttps://github.com/haleyga/arboriculture/blob/master/src) directory.
<br><br>

##### Compiling the TypeScript examples <a id="compile-examples"></a>

```bash
npm run compile:examples
```
This script compiles the TypeScript examples in the 
[`examples`](ttps://github.com/haleyga/arboriculture/blob/master/examples) directory.
<br><br>

### Documenting <a id="documenting"></a>

---

```bash
npm run doc
```
This will generate html documentation for the TypeScript source code via the 
[typedoc](https://github.com/TypeStrong/typedoc) tool.
<br><br>

##### predoc <a id="predoc"></a>

*Note: this step does not need to be run manually*

```bash
npm run prebuild
```
This simply prepares the doc environment by running [`clean:docs`](#clean-docs).
<br><br>

### Cleaning <a id="cleaning"></a>

---

```bash
npm run clean
```
A full clean will run each of the individual cleans below and completely resets the directory structure.
<br><br>

##### Clean sources folder <a id="clean-src"></a>

```bash
npm run clean:src
```
This will clean any residual `*.js` and `*.js.map` files generated from other scripts.
<br><br>

##### Clean distribution folder <a id="clean-dist"></a>

```bash
npm run clean:dist
```
This will completely remove the `dist` folder containing compiled and transpiled code ready for distribution.
<br><br>

##### Clean documentation folder <a id="clean-docs"></a>

```bash
npm run clean:docs
```
This will remove the documentation generated with the [`doc`](#documenting) script under the `docs/autogen` directory.
<br><br>

##### Clean examples folder <a id="clean-examples"></a>

```bash
npm run clean:examples
```
This will clean any residual `*.js` and `*.js.map` files generated from the [`compile:examples`](#compile-examples) 
script.
<br><br>

##### Clean miscellaneous items <a id="clean-misc"></a>

```bash
npm run clean:misc
```
This will remove `index.d.ts`, `index.js`, `index.js.map`, and any `npm-debug.log` that might have been generated.
<br><br>

### Testing <a id="testing"></a>

---

```bash
npm run test
```
This script will run all Mocha/Chai tests in the project.
<br><br>

### Transpiling <a id="transpiling"></a>

---

```bash
npm run transpile
```
This script will transpile the compiled ES6-compatible JavaScript in `dist/es6` to ES5-JavaScript and place the results
in `dist/es5`.

*Note: this command does not need to be run directly since it is chained after the [`build`](#building) script.*

*Note: for those running this command directly, it assumes a `dist/es6` directory exists and will transpile any
 JavaScript that resides there.*
<br><br>

##### pretranspile <a id="pretranspile"></a>

*Note: this step does not need to be run manually*

```bash
npm run pretranspile
```
This simply cleans the `dist/es5` directory.
<br><br>

##### posttranspile <a id="posttranspile"></a>

*Note: this step does not need to be run manually*

```bash
npm run posttranspile
```
This script continues the build chain by calling [`uglify`](#uglifying).
<br><br>

### Uglifying <a id="uglifying"></a>

---

```bash
npm run uglify
```
This script readies the JavaScript in `dist/es5` for deployment.  It concatenates, compresses, mangles, and uglifies the
code into an efficiently deployable product.

*Note: this command does not need to be run directly since it is chained after the [`transpile`](#transpiling) script.*

*Note: for those running this command directly, it assumes a `dist/es5` directory exists and will process any JavaScript
 that resides there.*
<br><br>

##### preuglify <a id="preuglify"></a>

*Note: this step does not need to be run manually*

```bash
npm run preuglify
```
This simply removes any existing deployable product.
<br><br>

### The Whole Nine Yards <a id="thewholenineyards"></a>

---

```bash
npm run thewholenine
```
This script will perform a complete pre-deployment workup (except auto-generated documentation).  It runs 
[`lint`](#linting), [`build`](#building) (including [`transpile`](#transpiling) and [`uglify`](#uglifying)), 
[`test`](#testing), and then [`securitycheck`](#security-check).

*Note: this script does not run [`doc`](#documenting) because that command will generate links to the most recent GitHub
 commit.  If no changes have been made to the code, links will be correct.  However, if you are checking code in after 
 this build, wait generate docs until after the push is accepted.*
 <br><br>
 
##### prethewholenine <a id="prethewholenine"></a>

*Note: this step does not need to be run manually*

```bash
npm run prethwholenine
```
This simply cleans the environment with [`clean`](#cleaning).
<br><br>

### Miscellaneous <a id="miscellaneous"></a>

---

##### Security Check <a id="security-check"></a>

```bash
npm run securitycheck
```
This script will run Node Security's [nsp](https://github.com/nodesecurity/nsp) tool to search for common security 
vulnerabilities in your code.
<br><br>
