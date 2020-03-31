import React from "react";
import { ModelContext } from "./ModelContext";

export function useModel() {
    const context = React.useContext(ModelContext);
    return context.model;
}
