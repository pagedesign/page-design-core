import React from "react";
import { findDOMNode } from "react-dom";
import { useDrop } from "react-dnd";
import withHooks from "with-component-hooks";
import ModelContext from "./ModelContext";

class DropEmptyContainer extends React.Component {
    static contextType = ModelContext;

    _connectDropTarget = null;

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
        const model = this.context;

        return {
            accept: model.getScope()
        };
    }

    render() {
        const [collectedProps, connectDropTarget] = useDrop(
            this.getDropOptions()
        );

        this._connectDropTarget = connectDropTarget;

        return this.props.children;
    }
}

export default withHooks(DropEmptyContainer);
