'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defaultAccessor(obj) {
  return obj.default;
}

var _bar = require('bar');

Object.keys(_bar).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _bar[key];
    }
  });
});

var _foo = _interopRequireDefault(require('foo'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var anything = {};
