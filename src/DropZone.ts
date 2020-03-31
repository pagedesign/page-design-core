import React from "react";
import { findDOMNode } from "react-dom";
import withHooks from "with-component-hooks";
import { useDrop } from "react-dnd";
import { ModelContext, ModelContextValue } from "./ModelContext";

class DropZone extends React.Component {
    static contextType = ModelContext;

    context: ModelContextValue;

    _connectDropTarget: (dom: HTMLElement | null) => void;

    connectDropTarget() {
        const dom = findDOMNode(this);

        this._connectDropTarget(dom);
    }

    componentDidMount() {
        this.connectDropTarget();
    }

    componentDidUpdate() {
        this.connectDropTarget();
    }

    componentWillUnmount() {
        this._connectDropTarget(null);
    }

    getDropOptions() {
        const model = this.context.model;

        return {
            accept: model.getScope(),
        };
    }

    render() {
        const [, connectDropTarget] = useDrop(this.getDropOptions());

        this._connectDropTarget = connectDropTarget;

        return this.props.children;
    }
}

const DropZoneWithHooks = withHooks(DropZone);

export { DropZoneWithHooks as DropZone };
