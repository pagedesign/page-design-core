import {
    DragSourceMonitor,
    DropTargetMonitor,
    DragLayerMonitor,
    ConnectDragSource,
    ConnectDragPreview,
    ConnectDropTarget,
} from "react-dnd";

import { Model } from "./Model";
import { WidgetItem } from "./WidgetItem";
import {
    DRAG_DIR_UP,
    DRAG_DIR_DOWN,
    DRAG_DIR_LEFT,
    DRAG_DIR_RIGHT,
    DRAG_DIR_NONE,
} from "./constants";

export type IdType = string | null;

export interface Item extends Record<string | number, any> {
    id: string | null;
    pid: string | number | null;
}

export interface DragObject {
    type: string;
    item?: Item;
    dom?: HTMLElement;
}

export interface DropResult {}

export interface DragCollectedProps {
    isDragging: boolean;
    monitor: DragSourceMonitor;
}

export interface DragState {
    item: null | Item;
    isNew: boolean;
    canDrop: boolean;
    hoverContainerId: IdType;
    hoverItem: null | Item;
    hoverDirection:
        | typeof DRAG_DIR_UP
        | typeof DRAG_DIR_DOWN
        | typeof DRAG_DIR_LEFT
        | typeof DRAG_DIR_RIGHT
        | typeof DRAG_DIR_NONE;
    dragDOMIsRemove: boolean;
    isDragging: boolean;
    currentDragDOM: null | HTMLElement;
    dragDOM: null | HTMLElement;
}

export interface CanDragOptions {
    monitor: DragSourceMonitor;
    model: Model;
    component: WidgetItem;
}

export interface CanDropOptions extends CanDragOptions {
    item: Item;
    dom: HTMLElement;
}

export interface DragHoverOptions extends CanDropOptions {}

export interface BeginDragOptions extends CanDropOptions {}

export interface EndDragOptions extends BeginDragOptions {}

export interface DropOptions extends CanDropOptions {}

export interface DropContainerRenderProps {
    monitor: DropTargetMonitor;
    canDrop: boolean;
    isOver: boolean;
    isStrictlyOver: boolean;
    model: Model;
    connectDropTarget: ConnectDropTarget;
    items: Item[];
    [propName: string]: any;
}

export interface WidgetItemRenderProps {
    monitor: DragSourceMonitor;
    isDragging: boolean;
    model: Model;
    connectDragSource: ConnectDragSource;
    connectDragPreview: ConnectDragPreview;
}
