import React from "react";

export default function ItemDragLayer({ dom, differenceFromInitialOffset }) {
    const [ret, initData] = React.useState(null);

    React.useEffect(() => {
        const cloneNode = dom.cloneNode(true);
        const rect = dom.getBoundingClientRect();

        initData({
            rect,
            cloneNode
        });

        cloneNode.style.position = "fixed";
        //重要
        cloneNode.style.pointerEvents = "none";
        cloneNode.style.opacity = 0.7;
        cloneNode.style.left = rect.left + "px";
        cloneNode.style.top = rect.top + "px";
        cloneNode.style.boxSizing = "border-box";
        cloneNode.style.width = rect.width + "px";
        cloneNode.style.height = rect.height + "px";
        cloneNode.style.fontSize = "12px";
        cloneNode.style.cursor = "default";

        document.body.appendChild(cloneNode);
        return () => {
            document.body.removeChild(cloneNode);
        };
    }, [dom]);

    if (ret) {
        const { cloneNode, rect } = ret;
        if (differenceFromInitialOffset) {
            cloneNode.style.left =
                rect.left + differenceFromInitialOffset.x + "px";
            cloneNode.style.top =
                rect.top + differenceFromInitialOffset.y + "px";
        }
    }

    return null;
}
