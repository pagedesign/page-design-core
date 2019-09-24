import React from "react";
import { useDragLayer } from "react-dnd";

export default ({ children }) => {
    const props = useDragLayer(monitor => {
        const dragResult = monitor.getItem();
        return [
            {
                type: monitor.getItemType(),
                isDragging: monitor.isDragging(),
                initialClientOffset: monitor.getInitialClientOffset(),
                initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
                clientOffset: monitor.getClientOffset(),
                differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
                sourceClientOffset: monitor.getSourceClientOffset(),
                ...dragResult
            },
            monitor
        ];
    });

    const child =
        typeof children === "function"
            ? children(props[0], props[1])
            : children;

    return child;
};
