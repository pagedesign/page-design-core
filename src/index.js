import { getEmptyImage } from "react-dnd-html5-backend";
import WebDesignDndProvider from "./WebDesignDndProvider";
import DropContainer from "./DropContainer";
import DropItem from "./DropItem";
import WidgetItem from "./WidgetItem";
import DragLayer from "./DragLayer";
import { useModel } from "./hooks";
import DropEmptyContainer from "./DropEmptyContainer";
import * as constants from "./constants";
import ModelContext from "./ModelContext";

const WebDesignContext = ModelContext;

export { useModel };

export {
    constants,
    WebDesignContext,
    WebDesignDndProvider,
    WidgetItem,
    DropContainer,
    DropItem,
    DragLayer,
    getEmptyImage,
    DropEmptyContainer
};
