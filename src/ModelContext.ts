import React from "react";
import { Model } from "./Model";
import { AXIS_VERTICAL, AXIS_HORIZONTAL, AXIS_BOTH } from "./constants";

export type ModelContextValue = { model: Model };

export type DropContainerContextValue = {
    isRootContainer: boolean;
    axis?: typeof AXIS_BOTH | typeof AXIS_HORIZONTAL | typeof AXIS_VERTICAL;
};

export const ModelContext = React.createContext<ModelContextValue>({
    model: {},
} as ModelContextValue);
