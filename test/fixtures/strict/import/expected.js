"use strict";

function _defaultAccessor(obj) {
  return obj.default;
}

var _foo = require("foo");

_defaultAccessor(_foo);
_defaultAccessor(_foo);
_foo.foo3;
(0, _foo.foo3)();
