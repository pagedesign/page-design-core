let state = {
    dragDOMIsRemove: false,
    isDragging: false,
    currentDragDOM: null
};

function setState(newState) {
    state = {
        ...state,
        ...newState
    };
}

function reset() {
    state.dragDOMIsRemove = false;
    state.isDragging = false;
    state.currentDragDOM = null;
}

function getState() {
    return state;
}

export default {
    setState,
    getState,
    reset
};
