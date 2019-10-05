import React from "react";

import AnimateContainer from "./AnimateContainer";

import DropContainerDemo from "./DropContainerDemo";
import DropContainerWithChildDemo from "./DropContainerWithChildDemo";

import { Provider, WidgetItem, DragLayer } from "@/src";

import widgets from "./widgets";

function randomStr() {
    return Math.random()
        .toString(16)
        .slice(2, 8);
}

let idx = 1;

function DragLayerDemo() {
    return (
        <DragLayer>
            {({ isDragging }) =>
                !isDragging ? null : (
                    <div
                        style={{
                            padding: 5,
                            background: "rgba(0,0,0,.2)",
                            position: "fixed",
                            top: 0,
                            right: 0
                        }}
                    >
                        dragLayer: isDragging...
                    </div>
                )
            }
        </DragLayer>
    );
}

export default function App() {
    const [metadata, onMetadataChange] = React.useState({
        items: []
    });

    function onChange(items) {
        onMetadataChange({
            items
        });
    }

    return (
        <Provider
            // 受控
            value={metadata.items}
            onChange={onChange}
            onDragStart={ev => {
                console.log("onDragStart", ev);
            }}
            onDragEnd={ev => {
                console.log("onDragEnd", ev);
            }}
            onDrop={ev => {
                console.log("onDrop", ev);
            }}
        >
            <div
                style={{
                    display: "flex",
                    height: "100%"
                }}
            >
                <div
                    style={{
                        width: 240,
                        flex: "none"
                    }}
                >
                    {widgets.map(widget => {
                        return (
                            <WidgetItem
                                key={widget.xtype}
                                // disabled={widget.xtype === "EX_URL_FIELD"}
                                getInstance={() => ({
                                    ...widget,
                                    id: randomStr(),
                                    pid: null,
                                    index: idx++
                                })}
                            >
                                {({ connectDragTarget }) => (
                                    <div
                                        ref={connectDragTarget}
                                        style={{
                                            height: 32,
                                            lineHeight: `32px`,
                                            padding: "0 20px"
                                        }}
                                    >
                                        {widget.title}
                                    </div>
                                )}
                            </WidgetItem>
                        );
                    })}
                </div>
                <DropContainerDemo title="A" />
                <DropContainerDemo pid="b" title="B" />
                <AnimateContainer />

                <DropContainerWithChildDemo title="Parent" />
                <DropContainerDemo
                    pid="d"
                    title="D"
                    canDrop={item => {
                        return item.xtype === "EX_TEXTAREA_FIELD";
                    }}
                />
                <DragLayerDemo />
            </div>
        </Provider>
    );
}
