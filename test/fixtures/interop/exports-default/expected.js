"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function _defaultAccessor(obj) {
  return obj.default;
}
exports.default = function () {};

exports.default = foo;
exports.default = 42;
exports.default = {};
exports.default = [];
exports.default = foo;
exports.default = class {};
function foo() {}
class Foo {}
exports.default = Foo;
exports.default = foo;

exports.default = function () {
  return "foo";
}();
module.exports = _defaultAccessor(exports);
