
import _extends from "@babel/runtime/helpers/extends";
import React from "react";
import { useDragLayer } from "react-dnd";
export default (function (_ref) {
  var children = _ref.children;
  var props = useDragLayer(function (monitor) {
    var dragResult = monitor.getItem();
    return _extends({}, dragResult, {
      monitor: monitor,
      // type: monitor.getItemType(), // 可能造成干扰
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
});