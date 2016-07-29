'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defaultAccessor(obj) {
  return obj['default'];
}

var _foo = _interopRequireDefault(require('foo'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

console.log(_defaultAccessor(_foo));

exports['default'] = 5;
