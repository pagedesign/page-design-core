
import _extends from "@babel/runtime/helpers/extends";
var state = {
  //part1
  //drag item
  item: null,
  isNew: false,
  canDrop: true,
  //hover container id
  hoverContainerId: null,
  //hover item
  hoverItem: null,
  hoverDirection: "none",
  //part2
  dragDOMIsRemove: false,
  isDragging: false,
  currentDragDOM: null
};

function setState(newState) {
  state = _extends({}, state, {}, newState);
}

function reset() {
  setState({
    item: null,
    isNew: false,
    canDrop: true,
    hoverContainerId: null,
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

export default {
  setState: setState,
  getState: getState,
  reset: reset
};