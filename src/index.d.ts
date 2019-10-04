import React from "react";
import {
    DragSourceMonitor,
    DropTargetMonitor,
    ConnectDragSource,
    ConnectDragPreview,
    ConnectDropTarget
} from "react-dnd";

declare namespace WebDesignDnd {
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
        type: "add" | "sort";
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
        value?: Item[];
        defaultValue?: Item[];
        axis?: "vertical" | "horizontal" | "both";
        commitAction?: "auto" | "drop";
        children?: React.ReactNode;
        onChange?: (items: Item[]) => void;
        onDragStart?: (e: DragStartEvent) => void;
        onDragEnd?: (e: DragEndEvent) => void;
        onDrop?: (e: DropEvent) => void;
        onDragHoverContainer?: (e: DragHoverContainerEvent) => void;
        onDragHoverItem?: (e: DropHoverItemEvent) => void;
    }

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
        hoverDirection: "up" | "down" | "left" | "right";
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
        axis?: "vertical" | "horizontal" | "both";
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
    }

    type DropContainerRender = (props: DropContainerRenderProps) => JSX.Element;

    interface DropContainerProps {
        pid: propTypes.any;
        children?: React.ReactNode | DropContainerRender;
        axis?: "vertical" | "horizontal" | "both";
        render?: DropContainerRender;
        collect?: (monitor: DropTargetMonitor) => {};
        canDrop?: (props: CanDropOptions) => boolean;
        hover?: (props: DragHoverOptions) => void;
        drop?: (props: DropOptions) => void;
    }

    export class WebDesignDndProvider extends React.Component<
        WebDesignDndProviderProps,
        WebDesignDndProviderState
    > {
        render(): JSX.Element;
    }

    export class Model extends React.Component<WebDesignDndProviderProps, {}> {
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
}

declare const WebDesignDndProvider = WebDesignDnd.WebDesignDndProvider;
declare const Model = WebDesignDnd.Model;
declare const WidgetItem = WebDesignDnd.WidgetItem;
declare const DropItem = WebDesignDnd.DropItem;
declare const DropContainer = WebDesignDnd.DropContainer;

export { WebDesignDndProvider, Model, WidgetItem, DropItem, DropContainer };
