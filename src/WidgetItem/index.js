import React from "react";
import propTypes from "prop-types";
import { findDOMNode } from "react-dom";
import { useDrag } from "react-dnd";
import withHooks from "with-component-hooks";
import ModelContext from "../ModelContext";
import { ACTION_ADD, ACTION_SORT } from "../constants";

class WidgetItem extends React.Component {
    static propTypes = {
        getInstance: propTypes.func.isRequired,
        disabled: propTypes.bool,
        canDrag: propTypes.func,
        beginDrag: propTypes.func,
        endDrag: propTypes.func
    };

    _connectDragSource = null;

    connectDrag() {
        const { disabled } = this.props;

        const dom = findDOMNode(this);
        if (this._connectDragSource) {
            this._connectDragSource(disabled ? null : dom);
        }
    }

    componentDidMount() {
        this.connectDrag();
    }

    componentDidUpdate() {
        this.connectDrag();
    }

    render() {
        const {
            children,
            getInstance,
            canDrag,
            beginDrag,
            endDrag
        } = this.props;

        const designer = React.useContext(ModelContext);

        const [collectProps, connectDragSource] = useDrag({
            item: {
                type: designer.getScope()
            },

            canDrag(monitor) {
                if (canDrag) {
                    return canDrag(monitor);
                }
                return true;
            },

            begin(monitor) {
                const item = getInstance();

                if (beginDrag) {
                    beginDrag(item, monitor);
                }

                designer.addTmpItem(item);

                designer.fireEvent("onDragStart", {
                    target: item,
                    action: ACTION_ADD
                });

                return {
                    item: item
                };
            },

            end(item, monitor) {
                if (endDrag) {
                    endDrag(item, monitor);
                }

                designer.clearTmpItems();

                designer.fireEvent("onDragEnd", {
                    target: item,
                    action: ACTION_ADD
                });
            },

            collect(monitor) {
                return {
                    monitor,
                    isDragging: monitor.isDragging()
                };
            }
        });

        this._connectDragSource = connectDragSource;

        const child =
            typeof children === "function" ? children(collectProps) : children;

        React.Children.only(child);

        return child;
    }
}

export default withHooks(WidgetItem);
