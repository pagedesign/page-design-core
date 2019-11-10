import React from "react";
import { DropContainer, DropItem } from "@/src";
export default function DropContainerWithChildDemo({ title, canDrop }) {
    return (
        <DropContainer id="parent" canDrop={canDrop}>
            {({ items, monitor, canDrop, connectDropTarget }) => {
                return (
                    <div
                        ref={connectDropTarget}
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

                        <DropContainer id="child" canDrop={() => true}>
                            {({
                                items,
                                monitor,
                                canDrop,
                                connectDropTarget
                            }) => {
                                return (
                                    <div
                                        ref={connectDropTarget}
                                        style={{
                                            height: 300,
                                            overflow: "auto",
                                            border: canDrop
                                                ? "1px solid green"
                                                : "1px solid #ccc",
                                            flex: 1
                                        }}
                                    >
                                        <h3>child</h3>
                                        <hr />
                                        {items.map(item => {
                                            return (
                                                <DropItem
                                                    key={item.id}
                                                    item={item}
                                                >
                                                    {({
                                                        connectDragAndDrop,
                                                        isDragging,
                                                        isHover,
                                                        isOver,
                                                        isTmp
                                                    }) => {
                                                        return (
                                                            <div
                                                                ref={
                                                                    connectDragAndDrop
                                                                }
                                                                style={{
                                                                    opacity: isDragging
                                                                        ? 0.5
                                                                        : 1,
                                                                    padding: 10,
                                                                    margin: 5,
                                                                    background:
                                                                        "#f2f2f2",
                                                                    border:
                                                                        "1px solid #dadada"
                                                                }}
                                                            >
                                                                {item.title}(
                                                                {item.id})
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
                    </div>
                );
            }}
        </DropContainer>
    );
}
