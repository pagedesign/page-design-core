import React from "react";
import { DropContainer, DropItem } from "@/src";

export default function AnimateContainer() {
    return (
        <DropContainer pid="Animate">
            {(items, { monitor, canDrop }) => {
                const list = [...items];
                list.sort((a, b) => a.index - b.index);

                function getPositionIndex(index) {
                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        if (item.index === index) return i;
                    }
                }

                return (
                    <div
                        style={{
                            position: "relative",
                            border: canDrop
                                ? "1px solid green"
                                : "1px solid #ccc",
                            flex: 1
                        }}
                    >
                        <h3>Animate</h3>
                        <hr />
                        <div
                            style={{
                                position: "relative"
                            }}
                        >
                            <div
                                style={{
                                    position: "relative"
                                }}
                            >
                                {list.map((item, index) => {
                                    var pos = getPositionIndex(item.index);

                                    return (
                                        <DropItem key={item.id} item={item}>
                                            {({
                                                connectDragAndDrop,
                                                isDragging,
                                                isHover,
                                                isOver,
                                                isTmp
                                            }) => {
                                                return (
                                                    <div
                                                        ref={connectDragAndDrop}
                                                        key={item.id}
                                                        id={item.id}
                                                        style={{
                                                            transition:
                                                                "transform .2s cubic-bezier(0.2, 0, 0, 1)",
                                                            position:
                                                                "absolute",
                                                            left: 5,
                                                            right: 5,
                                                            transform: `translate(0, ${(30 +
                                                                18) *
                                                                pos}px)`,
                                                            zIndex: isDragging
                                                                ? 2
                                                                : 1,
                                                            opacity: isDragging
                                                                ? 0.5
                                                                : 1,
                                                            padding: 10,
                                                            background:
                                                                "#f2f2f2",
                                                            border:
                                                                isOver &&
                                                                !isDragging
                                                                    ? "1px solid green"
                                                                    : "1px solid #dadada"
                                                        }}
                                                    >
                                                        {item.title}({item.id})
                                                    </div>
                                                );
                                            }}
                                        </DropItem>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            }}
        </DropContainer>
    );
}
