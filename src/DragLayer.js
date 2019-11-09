import React from "react";
import { useDragLayer } from "react-dnd";

export default ({ children }) => {
    const props = useDragLayer(monitor => {
        const dragResult = monitor.getItem();
        return {
            ...dragResult,
            monitor,
            type: monitor.getItemType(),
            isDragging: monitor.isDragging(),
            initialClientOffset: monitor.getInitialClientOffset(),
            initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
            clientOffset: monitor.getClientOffset(),
            differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
            sourceClientOffset: monitor.getSourceClientOffset()
        };
    });

    const child = typeof children === "function" ? children(props) : children;

    return child;
};
