/* Run tests expecting the following structure under test

 group/
   subgroup/
     options.json
     testName/
       actual.js
       expected.js
     options.json
   options.json
 options.json


 options.json are babel options for the tests in that group or test. Test options will be merged with group options.
 Plugin options will be merged by plugin as well.

 A special option "throws" can be present, which will test for an error being thrown matching the regex that's the value of
 the option.

 You can invoke this with options

 --path group/subgroup/test
 --path group/subgroup

 Only run tests that match the pattern, use a * to match any group or test. If only one segment is passed,
 will run all tests in the group. For example:

 mocha test/index.js --path fixtures/interop/imports-hoisting     // run just test fixtures/interop/imports-hoisting

 */

const assert = require('assert')
const eol = require('os').EOL
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const args = require('yargs').argv
const appRoot = require('app-root-path')

const babel = require('babel-core')
const codeFrame = require('babel-code-frame')

const buildExternalHelpers = babel.buildExternalHelpers

const babelHelpersEvaled = eval(buildExternalHelpers(null, 'var'))

const PLUGIN_NAME = 'transform-es2015-modules-commonjs-optimized'
const ORIGINAL_PLUGIN_NAME = 'transform-es2015-modules-commonjs'

const testPath = args.path
let parts = []

if (testPath) {
  parts = testPath.split('/')
  if (parts.length === 0 || parts.length > 3) {
    console.log("--path must include an argument that 1-3 parts, separated by a slash, e.g. '*/overview' or 'auxiliary-comment'")
    process.exit(1)
  }
}

while (parts.length < 3) parts.push('*')

const maxDepth = 2
const textEncoding = 'utf8'

function testGroup(dir, name, options, depth) {
  // var fixtureRoot = path.join(testRoot, testGroup);

  depth = depth || 0
  const opts = mergeOpts(options, getOpts(dir))

  const filter = parts[depth]


  // check for exec.js
  try {
    const fname = '/test' + name + '/exec.js'
    const js = fs.readFileSync(appRoot.resolve(fname), 'utf-8')

    testExec(name, js, opts)
  }
  catch (e) {
    if (e.code !== 'ENOENT') {
      throw e
    }

    // no exec.js - traverse for fixtures

    getDirectories(dir)
      .filter(function (folder) {
        return filter === '*' || folder === filter
      }).map(function (folder) {
        (depth === maxDepth ? test : testGroup)(path.join(dir, folder), `${name}/${folder}`, opts, depth + 1)
      })
  }
}

function runExec(opts, execCode) {
  const fn = new Function('babelHelpers', 'assert', 'transform', 'opts', 'exports', execCode)
  return fn.apply(null, [babelHelpersEvaled, assert, babel.transform, opts, {}])
}

// from babel-transform-fixture-test-runner

function testExec(name, execCode, execOpts) {
  const result = babel.transform(execCode, finalizeOpts(execOpts))
  execCode = result.code
  try {
    it(name, function () {
      runExec(execOpts, execCode)
    })
  } catch (err) {
    err.message = name + ': ' + err.message
    err.message += codeFrame(execCode)
    throw err
  }
}

function test(dir, name, options) {
  it(name, function () {
    const actualPath = path.join(dir, 'actual.js')
    const expectedPath = path.join(dir, 'expected.js')

    let opts = mergeOpts(options, getOpts(dir))
    const throwsOpt = opts.throws


    deleteTestingOptions(opts)

    opts = finalizeOpts(opts)

    let actual

    try {
      actual = babel.transformFileSync(actualPath, opts).code
    }
    catch (e) {
      if (throwsOpt) {
        const regex = new RegExp(throwsOpt)
        const expectedPattern = 'Pattern /' + throwsOpt + '/'
        if (!regex.test(e.message)) {
          assert.equal(expectedPattern, e.message, 'Should throw an error matching the pattern')
        } else {
          return assert.ok(expectedPattern)
        }
      }
      throw e
    }

    const expected = fs.readFileSync(expectedPath, textEncoding)

    assert.equal(normalizeEndings(actual), normalizeEndings(expected))
  })
}

function deleteTestingOptions(options) {
  ['throws'].forEach(function (e) {
    if (options[e]) delete options[e]
  })
}

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function (file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory()
  })
}

function getOpts(srcpath) {
  let opts = {}
  try {
    opts = JSON.parse(fs.readFileSync(path.resolve(srcpath, 'options.json'), textEncoding))
  }
  catch (e) { }
  return opts
}

function finalizeOpts(opts) {
  // convert module name to relative path

  opts.plugins = (opts.plugins || []).map(function (e) {
    if (e[0] === PLUGIN_NAME) {
      e[0] = appRoot.resolve('/lib')
    }

    return e.length === 1 ?
      e[0] :
      e
  })

  return opts
}

function mergeOpts(target, src) {
  let last = null

  let plugins = (target.plugins || [])
    .concat(src.plugins || [])

  plugins = plugins.map(function (e) {
    e = asArray(e)

    if (e[0] === ORIGINAL_PLUGIN_NAME) {
      e[0] = PLUGIN_NAME
    }
    return e
  })
  // remove dup module defs
    .sort(function (a, b) {
      return a[0].localeCompare(b[0])
    })
    .filter(function (e) {
      if (!last || e[0] !== last[0]) {
        last = e
        return true
      }

      // merge plugin options from child options.json
      if (e[1]) {
        last[1] = _.assign({}, last[1], e[1])
      }

      return false
    })


  const options = _.assign({}, target, src)
  options.plugins = plugins

  return options
}

function asArray(obj) {
  if (obj === null || obj === undefined) return []
  return Array.isArray(obj) ?
    obj.map(function (e) {
      return e
    }) :
    [obj]
}

/* ensure o/s specific line endings, and multiple blank lines aren't a problem:
 -- normalize line endings
 -- remove duplicate all all blank lines
 -- ensure every file ends with a newline
 */

function normalizeEndings(text) {
  text = text.replace(/\r\n/g, '\n')
  text = text + '\n'

  text = text.replace(/[\n]{2,}/g, '\n')
  text = text.replace(/\n/g, eol)

  return text
}

// main entry

testGroup(__dirname, '', {})
