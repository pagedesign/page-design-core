import React from "react";
import {
    DragSourceMonitor,
    DropTargetMonitor,
    DragLayerMonitor,
    ConnectDragSource,
    ConnectDragPreview,
    ConnectDropTarget
} from "react-dnd";
import { number } from "prop-types";

export const AXIS_VERTICAL = "vertical";
export const AXIS_HORIZONTAL = "horizontal";
export const AXIS_BOTH = "both";

declare namespace WebDesignDnd {
    type EventType = "add" | "drop";
    type Axis = "vertical" | "horizontal" | "both";
    type CommitAction = "auto" | "drop";
    type HoverDirection = "up" | "down" | "left" | "right" | "none";

    interface Point {
        x: number;
        y: number;
    }

    interface Item {
        id: string | number;
        pid: string | number | null;
        [propName: string]: any;
    }

    interface DragAndDropEvent {
        item: Item;
        dom: HTMLElement;
        component: any;
        monitor: DragSourceMonitor | DropTargetMonitor;
        model: Model;
    }

    interface DragStartEvent extends DragAndDropEvent {
        type: EventType;
    }

    interface DragEndEvent extends DragStartEvent {}

    interface DropEvent extends DragStartEvent {
        target: Item;
        targetDOM: HTMLElement;
    }

    interface DropHoverItemEvent extends DropEvent {}
    interface DragHoverContainerEvent extends DropEvent {
        target: any;
    }

    interface WebDesignDndProviderProps {
        idField: string | "id";
        pidField: string | "pid";
        value?: Item[];
        defaultValue?: Item[];
        axis?: Axis;
        commitAction?: CommitAction;
        children?: React.ReactNode;
        onChange?: (items: Item[]) => void;
        onDragStart?: (e: DragStartEvent) => void;
        onDragEnd?: (e: DragEndEvent) => void;
        onDrop?: (e: DropEvent) => void;
        onDragHoverContainer?: (e: DragHoverContainerEvent) => void;
        onDragHoverItem?: (e: DropHoverItemEvent) => void;
    }

    type ModelProps = WebDesignDndProviderProps;

    interface WebDesignDndProviderState {
        readonly scope: string;
        items: Item[];
    }

    interface CanDragOptions {
        monitor: DragSourceMonitor;
        model: Model;
        component: WidgetItem;
    }

    interface CanDropOptions extends CanDragOptions {
        item: Item;
        dom: HTMLElement;
    }

    interface DragHoverOptions extends CanDropOptions {}

    interface BeginDragOptions extends CanDropOptions {}

    interface EndDragOptions extends BeginDragOptions {}

    interface DropOptions extends CanDropOptions {}

    interface WidgetItemRenderProps {
        monitor: DragSourceMonitor;
        isDragging: boolean;
        model: Model;
        connectDragTarget: ConnectDragSource;
        connectDragPreview: ConnectDragPreview;
    }

    type WidgetItemRender = (props: WidgetItemRenderProps) => JSX.Element;

    interface WidgetItemProps {
        getInstance: () => Item;
        children?: React.ReactNode | WidgetItemRender;
        render?: WidgetItemRender;
        canDrag?: (props: CanDragOptions) => boolean;
        beginDrag?: (props: BeginDragOptions) => void;
        endDrag?: (props: EndDragOptions) => void;
    }

    interface DropItemRenderProps {
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
        connectDragTarget: ConnectDragSource;
        connectDragAndDrop: (dom: HTMLElement) => void;
        connectDragPreview: ConnectDragPreview;
    }

    type DropItemRender = (props: DropItemRenderProps) => JSX.Element;

    interface DropItemProps {
        item: Item;
        axis?: Axis;
        children?: React.ReactNode | DropItemRender;
        render?: DropItemRender;
        canDrop?: (props: CanDropOptions) => boolean;
        hover?: (props: DragHoverOptions) => void;
        canDrag?: (props: CanDragOptions) => void;
        beginDrag?: (props: BeginDragOptions) => void;
        endDrag?: (props: EndDragOptions) => void;
    }

    interface DropContainerRenderProps {
        monitor: DropTargetMonitor;
        canDrop: boolean;
        isOver: boolean;
        isStrictlyOver: boolean;
        model: Model;
        connectDropTarget: ConnectDropTarget;
        items: Items[];
        [propName: string]: any;
    }

    type DropContainerRender = (props: DropContainerRenderProps) => JSX.Element;

    interface DropContainerProps {
        pid: propTypes.any;
        children?: React.ReactNode | DropContainerRender;
        axis?: Axis;
        render?: DropContainerRender;
        collect?: (monitor: DropTargetMonitor) => {};
        canDrop?: (props: CanDropOptions) => boolean;
        hover?: (props: DragHoverOptions) => void;
        drop?: (props: DropOptions) => void;
    }

    interface DragLayerRenderProps {
        item: Item | null;
        dom: HTMLElement | null;
        monitor: DragLayerMonitor;
        type: any;
        isDragging: boolean;
        initialClientOffset: Point | null;
        initialSourceClientOffset: Point | null;
        clientOffset: Point | null;
        differenceFromInitialOffset: Point | null;
        sourceClientOffset: Point | null;
    }

    type DragLayerRender = (props: DragLayerRenderProps) => JSX.Element;

    interface DragLayerProps {
        children: React.ReactNode | DragLayerRender;
    }

    export class WebDesignDndProvider extends React.Component<
        WebDesignDndProviderProps,
        WebDesignDndProviderState
    > {
        getModel(): Model;
        render(): JSX.Element;
    }

    export class Model extends React.Component<ModelProps, {}> {
        render(): JSX.Element;
    }

    export class WidgetItem extends React.Component<WidgetItemProps, {}> {
        render(): JSX.Element;
    }

    export class DropItem extends React.Component<DropItemProps, {}> {
        render(): JSX.Element;
    }

    export class DropContainer extends React.Component<DropContainerProps, {}> {
        render(): JSX.Element;
    }

    export class DragLayer extends React.Component<DragLayerProps, {}> {
        render(): JSX.Element;
    }
}

declare const WebDesignDndProvider = WebDesignDnd.WebDesignDndProvider;
declare const WidgetItem = WebDesignDnd.WidgetItem;
declare const DropItem = WebDesignDnd.DropItem;
declare const DropContainer = WebDesignDnd.DropContainer;
declare const DragLayer = WebDesignDnd.DragLayer;

export { WebDesignDndProvider, WidgetItem, DropItem, DropContainer, DragLayer };
