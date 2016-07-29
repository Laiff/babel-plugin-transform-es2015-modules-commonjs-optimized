# babel-plugin-transform-es2015-modules-commonjs-optimized

## Installation

```sh
$ npm install babel-plugin-transform-es2015-modules-commonjs-optimized
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```js
// without options
{
  "plugins": ["transform-es2015-modules-commonjs-optimized"]
}

// with options
{
  "plugins": [
    ["transform-es2015-modules-commonjs", {
      "allowTopLevelThis": true
    }]
  ]
}
```

### Via CLI

```sh
$ babel --plugins transform-es2015-modules-commonjs-optimized script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["transform-es2015-modules-commonjs-optimized"]
});
```
