# page-design-core

## Install & Usage

`npm install --save page-design-core`

```
import * as PageDesignCore from 'page-design-core';

...

render(){
    return (
        <PageDesignCore.Provider>
        ...
        </PageDesignCore.Provider>
    );
}
...


```

## Provider Options

### children

`ReactNode | (model: Model) => JSX.Element`

### defaultValue

`Item[]`

项目列表

### value

`Item[]`

受控属性，项目列表

### axis

`"vertical" | "horizontal" | "both"` 默认：`vertical`

影响`DropItem`的`hoverDirection` 计算方式。

-   为`vertical`时`hoverDirection`有效值为: `"up" | "bottom" | "none"`
-   为`horizontal`时`hoverDirection`有效值为: `"left" | "right" | "none"`
-   为`both`时`hoverDirection`有效值为: `""up" | "bottom" | left" | "right" | "none"`

示例:

```
<DropItem>
{({hoverDirection}) => <div/>}
</DropItem>
```

### commitAction

`"auto" | "drop"` 默认：`auto`

区别：

-   `auto`：拖拽过程中实时改变拖拽目标的位置
-   `drop`：拖拽过程中不改变位置，释放目标后改变拖拽目标位置

> 如果设置为`drop`时，通常需要配合`hoverDirection`来实现拖拽的视觉效果

### idField

`string` 默认：`id`

如果指定属性不存在则会`随机生成`

### pidField

`string` 默认：`pid`

如果指定属性不存在默认为`null`

### onChange

`(items: Item[]) => void`

拖拽项目位置改变时触发

### onDragStart

`(e: DragStartEvent) => void`

开始拖拽时触发

-   `DragStartEvent.type` 拖拽模式：`add`（新增模式，`WidgetItem`触发） 或 `sort` （排序模式，`DropItem`触发）
-   `DragStartEvent.item` 拖拽项目
-   `DragStartEvent.dom` 拖拽项目 DOM 元素
-   `DragStartEvent.component` 拖拽项目对象
-   `DragStartEvent.monitor` 参考：http://react-dnd.github.io/react-dnd/docs/api/drag-source-monitor
-   `DragStartEvent.model` 数据模型对象 `Model`

### onDragEnd

`(e: DragEndEvent) => void`

拖拽项目释放时触发，触发晚于`onDrop`

属性同`onDragStart`

### onDropToItem

`(e: DropToItemEvent) => void`

拖拽项目释放到`DropItem`时触发

属性同`onDragStart`，另外两个属性：

-   `DropEvent.target: Item` 释放目标项目
-   `DropEvent.targetDOM` 释放目标 DOM 元素

### onDropToContainer

`(e: DropToContainerEvent) => void`

拖拽项目释放到`DropContainer`时触发

属性同`onDragStart`，另外两个属性：

-   `DropEvent.target: string | number | null` 释放目标项目
-   `DropEvent.targetDOM: HTMLElement` 释放目标 DOM 元素

### onDrop

`(e: DropEvent) => void`

拖拽项目释放到`DropItem`或`DropContainer`时触发

属性同`onDragStart`，另外两个属性：

-   `DropEvent.target: Item | string | number | null` 释放目标项目
-   `DropEvent.targetDOM` 释放目标 DOM 元素

> 注：当释放目标为`DropContainer`时`DropEvent.target`的类型为`string | number | null`，如果释放目标为`DropItem`是`DropEvent.target`的类型为`Item`
>
> 所以在接收时注意要对`DropEvent.target`类型进行判断，eg: `isObject(target) ? xx : yy`

### onDragHoverContainer

`(e: DragHoverContainerEvent) => void`

拖拽项目经过`DropContainer`时触发

### onDragHoverItem

`(e: DragHoverItemEvent) => void`

拖拽项目经过`DropItem`时触发

### onDragHover

`(e: DragHoverEvent) => void`

拖拽项目经过`DropContainer`或`DropItem`时触发

属性同`onDrop`

## DropContainer Options

### id

`string | number | null` 默认：`null`

容器 ID，当项目释放到当前容器时，该项目的`pid`会自动设置为当前容器的`id`

> 当`DropContainer`存在嵌套的情况下，子`DropContainer`的`id`必须设置

### children

`ReactNode | (props: DropContainerRenderProps) => JSX.Element`

children 为函数时，`props`参数说明：

-   `props.monitor` 参考：http://react-dnd.github.io/react-dnd/docs/api/drop-target-monitor
-   `props.isOver: boolean` 拖拽项目是否经过当前组件，效果同`monitor.isOver()`
-   `props.isStrictlyOver: boolean` 拖拽项目是否经过当前组件（不进行冒泡），效果同`monitor.isOver({ shallow: true })`
-   `props.model` 数据模型对象 `Model`
-   `props.connectDropTarget: (dom) => void` 拖拽释放关联，使指定 DOM 元素具备接收`drop`能力。 eg: `connectDropTarget(dom)`
-   `props.items: Item[]` 当前容器的子项目，效果类似`model.getChildren(id)`，但不建议通过`model`的方式自行获取
-   `props.canDrop: boolean` 当前容器是否能接收目标 `boolean`

### render

`(props: DropContainerRenderProps) => JSX.Element`

作用同`children`，优先级低于`children`

### axis

作用同 `Provider Options`的`axis`，但`DropContainer`的优先级高

### canDrop

`(props: CanDropOptions) => boolean`

限制`DropContainer`是否能接收拖拽项目

-   `CanDropOptions.item` 拖拽项目
-   `CanDropOptions.dom` 拖拽项目 DOM 元素
-   `CanDropOptions.monitor` 参考：http://react-dnd.github.io/react-dnd/docs/api/drop-target-monitor
-   `CanDropOptions.model` 数据模型对象 `Model`
-   `CanDropOptions.component` 当前`DropContainer`对象

> 注：`canDrop` 和 `connectDropTarget` 实现效果类似

### hover

`(props: CanDropOptions) => boolean`

拖拽项经过容器时触发，包含冒泡，参数同 `canDrop`

> 注：是否经过当前组件时可通过`monitor.isOver({ shallow: true })` 判断，否则就是通过冒泡响应

### drop

`(props: CanDropOptions) => boolean`

拖拽释放到当前容器时触发，包含冒泡，参数同 canDrop

> 注：有可能是释放到当前容器下的子容器。`monitor.didDrop()`可判断

## DropItem Options

### item

`Item` **必填** 项目对象，

### children

`ReactNode | (props: DropItemRenderProps) => JSX.Element`

children 为函数时，`props`属性说明：

-   `item:Item` 项目对象
-   `isDragging: boolean` 当前组件是否处于拖拽中
-   `isOver: boolean` 推拽中的项目是否正经过当前组件，可能是冒泡触发，效果同`monitor.isOver()`
-   `isStrictlyOver: boolean` 推拽中的项目是否正经过当前组件，效果同`monitor.isOver({ shallow: true })`
-   `canDrop: boolean` 当前组件是否能接收拖拽目标目标，只有使用了`connectDropTarget`才可能为`true`
-   `hoverDirection: "up" | "down" | "left" | "right" | "none"` 拖拽项目经过当前组件所在的位置，通过对角线进行分割的四块区域。受`axis`影响
-   `isTmp: boolean` 拖拽节点处于未提交状态，通常在拖拽`WidgetItem`时有效，如果不是自行操作 model，那么当前字段基本都为`false`
-   `model: Model` 数据模型对象
-   `monitor: DragSourceMonitor` 参考：http://react-dnd.github.io/react-dnd/docs/api/drop-target-monitor
-   `connectDropTarget:dom => void` 使指定 DOM 元素具备接收`drop`能力。
-   `connectDragTarget:dom => void` 使指定 DOM 元素具备拖拽`drag`的能力。
-   `connectDragPreview:dom => void` 使用指定的 DOM 元素作为 `drag`的预览效果，如果不设置则使用系统默认，通常情况不需要设置，但下在配合`DragLayer`下一般使用一个透明图片作为占位符，例如: `connectDragPreview(getEmptyImage())`。
-   `connectDragAndDrop:dom => void` 使指定 DOM 元素具备 `drag` 和 `drop` 能力。

### render

作用同`children`，优先级低于`children`

### axis

作用同 `Provider Options`的`axis`，优先级最高

### canDrop

作用同 `DropContainer Options`的`canDrop`

### hover

作用同 `DropContainer Options`的`hover`

### canDrag

`(props: CanDragOptions) => boolean`

`DropItem`是否能能拖拽，`props`属性如下：

-   `monitor:DragSourceMonitor` 参考：http://react-dnd.github.io/react-dnd/docs/api/drag-source-monitor
-   `model: Model` 数据模型对象
-   `component: DropItem` 当前`DropItem`对象

### beginDrag

`(props: BeginDragOptions) => void`

当前组件拖拽前触发，属性作用同 `DropContainer Options`的`canDrop`

### endDrag

`(props: EndDragOptions) => void`

当前组件拖拽结束后触发，触发时机晚于比`drop`，属性作用同 `DropContainer Options`的`canDrop`

## WidgetItem Options

### getInstance

`() => Item` **必填**

当前组件拖拽时触发调用，需要返回一个`Item`实例。

### children

`ReactNode | (props: WidgetItemRenderProps) => JSX.Element`

children 为函数时，`props`属性说明：

-   `isDragging: boolean` 当前组件是否处于拖拽中
-   `model: Model` 数据模型对象
-   `monitor: DragSourceMonitor` 参考：http://react-dnd.github.io/react-dnd/docs/api/drop-target-monitor
-   `connectDragTarget:dom => void` 使指定 DOM 元素具备拖拽`drag`的能力。
-   `connectDragPreview:dom => void` 使用指定的 DOM 元素作为 `drag`的预览效果，如果不设置则使用系统默认，通常情况不需要设置，但下在配合`DragLayer`下一般使用一个透明图片作为占位符，例如: `connectDragPreview(getEmptyImage())`。

### render

作用同`children`，优先级低于`children`

### canDrag

作用同 `DropItem Options`的`canDrag`

### beginDrag

作用同 `DropItem Options`的`beginDrag`

### endDrag

作用同 `DropItem Options`的`endDrag`

## DragLayer

`ReactNode | (props: WidgetItemRenderProps) => JSX.Element`

children 为函数时，`props`属性说明：

-   `item: Item | null` 如果不为`null`的情况，item 组件处于拖拽中
-   `dom: HTMLElement | null` 如果不为`null`的情况，为拖拽中组件的 DOM 元素
-   `isDragging: boolean` 组件是否处于拖拽中。
-   `monitor: DragLayerMonitor` 参考：http://react-dnd.github.io/react-dnd/docs/api/drag-layer-monitor
-   `initialClientOffset: Point | null` 参考：http://react-dnd.github.io/react-dnd/docs/api/drag-layer-monitor
-   `initialSourceClientOffset: Point | null` 参考：http://react-dnd.github.io/react-dnd/docs/api/drag-layer-monitor
-   `clientOffset: Point | null` 参考：http://react-dnd.github.io/react-dnd/docs/api/drag-layer-monitor
-   `differenceFromInitialOffset: Point | null` 参考：http://react-dnd.github.io/react-dnd/docs/api/drag-layer-monitor
-   `sourceClientOffset: Point | null` 参考：http://react-dnd.github.io/react-dnd/docs/api/drag-layer-monitor

## DropZone

当前组件辅助于拖拽时鼠标指针样式不变为 `none`，提升交互效果，通常紧跟 `Provider`以前使用，例如：

```
<PageDesignCore.Provider>
    <DropZone>
    ...
    </DropZone>
</PageDesignCore.Provider>
```

## getEmptyImage

返回一个透明图片作为占位元素

## hooks

-   `useModel` 获取数据模型对象

## contains

## Model Apis

> model 类主要用于操作项目列表

### getChildren(id: any) => Item[]

获取指定 id 的子项目列表

### getItem(id: any) => Item | undefined

获取指定 id 的项目对象

### isDragging(id?: any) => boolean

如果 id 不传代表检测当前是否处于拖拽中，如果传 id 则返回当前组件是否处于拖拽中

### getDraggingItem(id: any) => Item | null

返回处于拖拽中的项目对象

### removeItem(id: any) => void;

移除指定 id 的项目对象

### addItem(item:Item, pid: any) => void;

添加项目

### addItems(items: Item[], pid: any) => void;

批量添加项目

> 这里只列举了可能常用的 api，其他高级 api 建议自行处理。

```ts
export const EVENT_TYPE_ADD = "add";
export const EVENT_TYPE_SORT = "sort";

export const DRAG_DIR_UP = "up";
export const DRAG_DIR_DOWN = "down";
export const DRAG_DIR_LEFT = "left";
export const DRAG_DIR_RIGHT = "right";
export const DRAG_DIR_NONE = "none";

export const COMMIT_ACTION_AUTO = "auto";
export const COMMIT_ACTION_DROP = "drop";

export const AXIS_VERTICAL = "vertical";
export const AXIS_HORIZONTAL = "horizontal";
export const AXIS_BOTH = "both";
```

## Types

```ts
type EventType = "add" | "sort";
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

interface DropToItemEvent extends DragStartEvent {
    target: Item;
    targetDOM: HTMLElement;
}

interface DropToContainerEvent extends DragStartEvent {
    target: string | number | null;
    targetDOM: HTMLElement;
}

interface DropEvent extends DragStartEvent {
    target: Item | string | number | null;
    targetDOM: HTMLElement;
}

interface DragHoverItemEvent extends DropToItemEvent {}
interface DragHoverContainerEvent extends DropToContainerEvent {}
interface DragHoverEvent extends DropEvent {}

interface ProviderProps {
    backend: object;
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
    onDropToItem?: (e: DropToItemEvent) => void;
    onDropToContainer?: (e: DropToContainerEvent) => void;
    onDrop?: (e: DropEvent) => void;
    onDragHoverContainer?: (e: DragHoverContainerEvent) => void;
    onDragHoverItem?: (e: DragHoverItemEvent) => void;
    onDragHover?: (e: DragHoverEvent) => void;
}

type ModelProps = ProviderProps;

interface ProviderState {
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
    id: any;
    children?: React.ReactNode | DropContainerRender;
    axis?: Axis;
    render?: DropContainerRender;
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

export class Provider extends React.Component<ProviderProps, ProviderState> {
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

export class DropZone extends React.Component<{}, {}> {
    render(): JSX.Element;
}
```
