import React from "react";
import { useDragLayer } from "react-dnd";

export default ({ children }) => {
    const props = useDragLayer(monitor => {
        return [
            {
                type: monitor.getItemType(),
                item: monitor.getItem(),
                isDragging: monitor.isDragging(),
                initialClientOffset: monitor.getInitialClientOffset(),
                initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
                clientOffset: monitor.getClientOffset(),
                differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
                sourceClientOffset: monitor.getSourceClientOffset()
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
