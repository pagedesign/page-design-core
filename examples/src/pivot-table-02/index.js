import React from "react";
import cx from "classnames";
import {
    PageDesignCore as Provider,
    DropContainer,
    DropItem,
    DragLayer,
    WidgetItem,
    getEmptyImage,
    DropZone,
} from "@/src";
import fields from "./fields";
import ItemDragLayer from "./ItemDragLayer";
import "./index.scss";

let fid = 1;

function FieldItem({ field }) {
    return (
        <WidgetItem
            getInstance={() => {
                return {
                    ...field,
                    id: fid++,
                };
            }}
        >
            {({ connectDragSource, connectDragPreview }) => {
                connectDragPreview(getEmptyImage());
                return (
                    <div className="field-item" ref={connectDragSource}>
                        {field.title}
                    </div>
                );
            }}
        </WidgetItem>
    );
}

function DropFieldContainer({ id: pid }) {
    const _canDrop = React.useCallback(
        ({ item, model }) => {
            if (item.id === "∑" && (pid === "value" || pid === "filter"))
                return false;

            if (pid === "value") return true;

            const items =
                pid === "filter"
                    ? model.getChildren("filter")
                    : [
                          ...model.getChildren("column"),
                          ...model.getChildren("row"),
                      ];
            const names = items.map(item => item.name);
            const ids = items.map(item => item.id);

            //已存在的数据可排序
            if (ids.indexOf(item.id) !== -1) return true;

            //检测新增数据
            return names.indexOf(item.name) !== -1 ? false : true;
        },
        [pid]
    );

    return (
        <DropContainer id={pid} canDrop={_canDrop}>
            {({ items, connectDropTarget, canDrop, isStrictlyOver, model }) => {
                return (
                    <div
                        ref={connectDropTarget}
                        className={cx({
                            "field-drop-list": true,
                            "can-drop": canDrop,
                            "is-over": canDrop && isStrictlyOver,
                        })}
                    >
                        {items.map(item => {
                            return (
                                <DropItem
                                    canDrop={_canDrop}
                                    item={item}
                                    key={item.id}
                                >
                                    {({
                                        isDragging,
                                        connectDropTarget,
                                        connectDragSource,
                                        connectDragPreview,
                                        model,
                                        hoverDirection,
                                    }) => {
                                        connectDragPreview(getEmptyImage());
                                        return (
                                            <div
                                                style={{
                                                    opacity: isDragging
                                                        ? 0.5
                                                        : 1,
                                                }}
                                                className={
                                                    "field-drop-item hover-dir-" +
                                                    hoverDirection
                                                }
                                                ref={connectDropTarget}
                                            >
                                                <div
                                                    className="field-drop-item-inner"
                                                    ref={connectDragSource}
                                                >
                                                    {item.title}
                                                    {pid === "value" &&
                                                    item.type === "number"
                                                        ? "(求和)"
                                                        : ""}
                                                    {pid === "value" &&
                                                    item.type !== "number"
                                                        ? "(计数)"
                                                        : ""}{" "}
                                                    {item.id === "∑" ? null : (
                                                        <span
                                                            className="item-close"
                                                            onClick={() => {
                                                                model.removeItem(
                                                                    item.id
                                                                );
                                                            }}
                                                        >
                                                            x
                                                        </span>
                                                    )}
                                                </div>
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

const E_VALUE_ITEM = {
    id: "∑",
    title: "∑数值",
    name: "∑Values",
    type: "number",
    pid: "column",
};

export default () => {
    const [value, onChange] = React.useState([]);

    const handleChange = React.useCallback(
        items => {
            const valueItems = items.filter(item => item.pid === "value");
            const shouldShowEValue = valueItems.length > 1;
            const EVI = items.filter(item => item.id === "∑");
            if (shouldShowEValue) {
                if (!EVI.length) {
                    items.push({ ...E_VALUE_ITEM });
                }
            } else {
                items = items.filter(item => item.id !== "∑");
            }

            onChange(items);
        },
        [value]
    );

    return (
        <Provider value={value} commitAction="drop" onChange={handleChange}>
            <DropZone>
                <div
                    className="pivot-container-02"
                    style={{
                        position: "relative",
                        display: "flex",
                        margin: "30px auto",
                        height: "80%",
                        width: 888,
                    }}
                >
                    <div className="pivot-field-list">
                        <div className="list-header">字段列表</div>
                        <div className="list-wrapper">
                            {fields.map(field => (
                                <FieldItem field={field} key={field.name} />
                            ))}
                        </div>
                    </div>
                    <div className="pivot-field-result">
                        <div className="result-drop">
                            <div className="drop-column-wrapper">
                                <div className="drop-field-label">筛选</div>
                                <div className="drop-field-list">
                                    <DropFieldContainer id="filter" />
                                </div>
                            </div>
                            <div className="drop-row-wrapper">
                                <div className="drop-field-label">列</div>
                                <div className="drop-field-list">
                                    <DropFieldContainer id="row" />
                                </div>
                            </div>
                            <div className="drop-column-wrapper">
                                <div className="drop-field-label">行</div>
                                <div className="drop-field-list">
                                    <DropFieldContainer id="column" />
                                </div>
                            </div>
                            <div className="drop-value-wrapper">
                                <div className="drop-field-label">值</div>
                                <div className="drop-field-list">
                                    <DropFieldContainer id="value" />
                                </div>
                            </div>
                        </div>
                        <div className="result-data">
                            <pre>{JSON.stringify(value, null, 2)}</pre>
                        </div>
                    </div>
                    <DragLayer>
                        {({ isDragging, dom, ...props }) => {
                            if (!isDragging || !dom) return null;
                            return <ItemDragLayer dom={dom} {...props} />;
                        }}
                    </DragLayer>
                </div>
            </DropZone>
        </Provider>
    );
};
