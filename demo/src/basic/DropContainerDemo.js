import React from "react";
import { DropContainer, DropItem } from "@/src";

export default function DropContainerDemo({ pid = null, title, canDrop }) {
    return (
        <DropContainer pid={pid} canDrop={canDrop}>
            {(items, { monitor, canDrop }) => {
                return (
                    <div
                        style={{
                            border: canDrop
                                ? "1px solid green"
                                : "1px solid #ccc",
                            flex: 1
                        }}
                    >
                        <h3>{title}</h3>
                        <hr />
                        {items.map(item => {
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
                                                style={{
                                                    opacity: isDragging
                                                        ? 0.5
                                                        : 1,
                                                    padding: 10,
                                                    margin: 5,
                                                    background: "#f2f2f2",
                                                    border: "1px solid #dadada"
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
                );
            }}
        </DropContainer>
    );
}
