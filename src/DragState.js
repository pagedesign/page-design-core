let state = {
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
    state = {
        ...state,
        ...newState
    };
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
    setState,
    getState,
    reset
};
