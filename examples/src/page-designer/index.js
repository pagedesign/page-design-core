import React from "react";
import classnames from "classnames";
import "./index.scss";

import {
    PageDesignCore as Provider,
    WidgetItem,
    DropContainer,
    DropItem,
    DragLayer,
} from "@/src";

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
            {({ isDragging, ...rest }) => {
                return !isDragging ? null : (
                    <div
                        style={{
                            padding: 5,
                            background: "rgba(0,0,0,.2)",
                            position: "fixed",
                            top: 0,
                            right: 0,
                        }}
                    >
                        dragLayer: isDragging...
                    </div>
                );
            }}
        </DragLayer>
    );
}

function Widget({ widget }) {
    return (
        <WidgetItem
            getInstance={() => ({
                ...widget,
                id: randomStr(),
            })}
        >
            {({ connectDragSource }) => {
                return (
                    <div ref={connectDragSource} className="widget-item">
                        {widget.title}
                    </div>
                );
            }}
        </WidgetItem>
    );
}

function PreviewField({ item }) {
    return (
        <DropItem item={item}>
            {({ item, connectDragAndDrop, isDragging }) => {
                return (
                    <div
                        ref={connectDragAndDrop}
                        className="preview-field-wrapper"
                    >
                        <div
                            className={classnames({
                                "preview-field": true,
                                "is-dragging": isDragging,
                            })}
                        >
                            <div className="label">{item.title}</div>
                            <div className="control">{item.id}</div>
                        </div>
                        {item.xtype === "GroupField" ? (
                            <GroupContainer item={item} />
                        ) : null}
                    </div>
                );
            }}
        </DropItem>
    );
}

function GroupContainer({ item }) {
    return (
        <DropContainer id={item.id}>
            {({ items, connectDropTarget }) => {
                return (
                    <div ref={connectDropTarget} className="group-field-list">
                        {items.map(item => (
                            <PreviewField
                                key={item.id}
                                item={item}
                            ></PreviewField>
                        ))}
                    </div>
                );
            }}
        </DropContainer>
    );
}

export default class FormDesigner extends React.Component {
    state = {
        items: [],
    };

    handleChange = items => {
        this.setState({
            items,
        });
    };

    renderFieldList = ({ connectDropTarget, items, model }) => {
        const isDraggingMode = model.isDragging();
        return (
            <div
                ref={connectDropTarget}
                className={classnames({
                    "field-list-wrapper": true,
                    "is-dragging-mode": isDraggingMode,
                })}
            >
                {items.map(item => (
                    <PreviewField key={item.id} item={item}></PreviewField>
                ))}
            </div>
        );
    };

    renderLayout() {
        return (
            <div className="form-designer">
                <div className="widgets-panel">
                    {widgets.map(widget => (
                        <Widget widget={widget} key={widget.xtype} />
                    ))}
                </div>
                <div className="designer-container">
                    <DropContainer id={null}>
                        {this.renderFieldList}
                    </DropContainer>
                </div>
            </div>
        );
    }

    render() {
        const { items } = this.state;

        return "comming soon...";

        return (
            <Provider
                value={items}
                onChange={this.handleChange}
                ref={p => (window.p = p)}
            >
                {this.renderLayout()}
            </Provider>
        );
    }
}
