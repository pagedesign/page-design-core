import React from "react";
import propTypes from "prop-types";
import { findDOMNode } from "react-dom";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import withHooks from "with-component-hooks";
import ModelContext from "../ModelContext";
import { ACTION_ADD, ACTION_SORT } from "../constants";

class WidgetItem extends React.Component {
    static propTypes = {
        children: propTypes.func.isRequired,
        getInstance: propTypes.func.isRequired,
        canDrag: propTypes.func,
        beginDrag: propTypes.func,
        endDrag: propTypes.func
    };

    render() {
        const {
            children,
            getInstance,
            canDrag,
            beginDrag,
            endDrag
        } = this.props;

        const designer = React.useContext(ModelContext);

        const [collectProps, connectDragTarget, connectDragPreview] = useDrag({
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

                designer.fireEvent("onDragStart", {
                    item,
                    action: ACTION_ADD
                });

                designer.addTmpItem(item);

                return {
                    item: item
                };
            },

            end(item, monitor) {
                if (endDrag) {
                    endDrag(item, monitor);
                }

                designer.fireEvent("onDragEnd", {
                    item,
                    action: ACTION_ADD
                });

                designer.clearTmpItems();
            },

            collect(monitor) {
                return {
                    monitor,
                    isDragging: monitor.isDragging()
                };
            }
        });

        return children({
            ...collectProps,
            connectDragTarget,
            connectDragPreview
        });
    }
}

export default withHooks(WidgetItem);
