
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _react = _interopRequireDefault(require("react"));

var _reactDnd = require("react-dnd");

var _default = function _default(_ref) {
  var children = _ref.children;
  var props = (0, _reactDnd.useDragLayer)(function (monitor) {
    var dragResult = monitor.getItem();
    return (0, _objectSpread2["default"])({}, dragResult, {
      monitor: monitor,
      type: monitor.getItemType(),
      isDragging: monitor.isDragging(),
      initialClientOffset: monitor.getInitialClientOffset(),
      initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
      clientOffset: monitor.getClientOffset(),
      differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
      sourceClientOffset: monitor.getSourceClientOffset()
    });
  });
  var child = typeof children === "function" ? children(props) : children;
  return child;
};

exports["default"] = _default;