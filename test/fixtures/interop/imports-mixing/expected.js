"use strict";

function _defaultAccessor(obj) {
  return obj.default;
}

var _foo = require("foo");

var _foo2 = babelHelpers.interopRequireDefault(_foo);

_defaultAccessor(_foo2);
_foo.baz;
