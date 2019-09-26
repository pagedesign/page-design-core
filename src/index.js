import { getEmptyImage } from "react-dnd-html5-backend";
import WebDesignDndProvider from "./WebDesignDndProvider";
import { DropContainer, DropItem } from "./DropContainer";
import WidgetItem from "./WidgetItem";
import DragLayer from "./DragLayer";
import { useModel } from "./hooks";

import ModelContext from "./ModelContext";

const WebDesignContext = ModelContext;

export { useModel };

export {
    WebDesignContext,
    WebDesignDndProvider,
    WidgetItem,
    DropContainer,
    DropItem,
    DragLayer,
    getEmptyImage
};
