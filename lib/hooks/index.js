
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useModel = useModel;

var _react = _interopRequireDefault(require("react"));

var _ModelContext = _interopRequireDefault(require("../ModelContext"));

function useModel() {
  return _react["default"].useContext(_ModelContext["default"]);
}