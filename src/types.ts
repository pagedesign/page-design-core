import {
    DragSourceMonitor,
    DropTargetMonitor,
    DragLayerMonitor,
    ConnectDragSource,
    ConnectDragPreview,
    ConnectDropTarget,
    XYCoord,
} from "react-dnd";

import { Model } from "./Model";
// import { WidgetItem } from "./WidgetItem";
import {
    DRAG_DIR_UP,
    DRAG_DIR_DOWN,
    DRAG_DIR_LEFT,
    DRAG_DIR_RIGHT,
    DRAG_DIR_NONE,
} from "./constants";

export type DirType =
    | typeof DRAG_DIR_UP
    | typeof DRAG_DIR_DOWN
    | typeof DRAG_DIR_LEFT
    | typeof DRAG_DIR_RIGHT;

export type HoverDirection = DirType | typeof DRAG_DIR_NONE;

export type IdType = string | null;

export interface Item extends Record<string | number, any> {
    id: IdType;
    pid: IdType;
    __tmp__?: boolean;
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

export interface CanDragOptions<T, D = DragSourceMonitor> {
    monitor: D;
    model: Model;
    component: T;
}

export interface CanDropOptions<T> extends CanDragOptions<T> {
    item: Item;
    dom: HTMLElement;
}

export interface DragHoverOptions<T> extends CanDropOptions<T> {}

export interface BeginDragOptions<T> extends CanDropOptions<T> {}

export interface EndDragOptions<T> extends CanDropOptions<T> {}

export interface DropOptions<T, D = DragSourceMonitor>
    extends CanDragOptions<T, D> {
    item: Item;
    dom: HTMLElement;
}

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

export interface DropItemRenderProps {
    monitor: DropTargetMonitor;
    hoverDirection: HoverDirection;
    isOver: boolean;
    isStrictlyOver: boolean;
    canDrop: boolean;
    isDragging: boolean;
    item: Item;
    isTmp: boolean;
    model: Model;
    connectDropTarget: ConnectDropTarget;
    connectDragSource: ConnectDragSource;
    connectDragAndDrop: (dom: HTMLElement | null) => void;
    connectDragPreview: ConnectDragPreview;
}

export interface DragLayerRenderProps {
    type: string;
    dom: HTMLElement;
    item: Item;
    monitor: DragLayerMonitor;
    isDragging: boolean;
    initialClientOffset: XYCoord | null;
    initialSourceClientOffset: XYCoord | null;
    clientOffset: XYCoord | null;
    differenceFromInitialOffset: XYCoord | null;
    sourceClientOffset: XYCoord | null;
}
