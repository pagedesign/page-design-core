import React from "react";
import ModelContext from "../ModelContext";

export function useModel() {
    return React.useContext(ModelContext);
}
