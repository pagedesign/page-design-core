
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var state = {
  //part1
  //drag item
  item: null,
  isNew: false,
  canDrop: true,
  //hover container pid
  hoverPid: null,
  //hover item
  hoverItem: null,
  hoverDirection: "none",
  //part2
  dragDOMIsRemove: false,
  isDragging: false,
  currentDragDOM: null
};

function setState(newState) {
  state = (0, _extends2.default)({}, state, {}, newState);
}

function reset() {
  setState({
    item: null,
    isNew: false,
    canDrop: true,
    hoverPid: null,
    hoverItem: null,
    hoverDirection: "none",
    dragDOMIsRemove: false,
    isDragging: false,
    currentDragDOM: null
  });
}

function getState() {
  return state;
}

var _default = {
  setState: setState,
  getState: getState,
  reset: reset
};
exports.default = _default;