
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactDnd = require("react-dnd");

var _default = function _default(_ref) {
  var children = _ref.children;
  var props = (0, _reactDnd.useDragLayer)(function (monitor) {
    return [{
      type: monitor.getItemType(),
      item: monitor.getItem(),
      isDragging: monitor.isDragging(),
      initialClientOffset: monitor.getInitialClientOffset(),
      initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
      clientOffset: monitor.getClientOffset(),
      differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
      sourceClientOffset: monitor.getSourceClientOffset()
    }, monitor];
  });
  var child = typeof children === "function" ? children(props[0], props[1]) : children;
  return child;
};

exports["default"] = _default;