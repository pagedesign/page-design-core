
import React from "react";
import ModelContext from "./ModelContext";
export function useModel() {
  var context = React.useContext(ModelContext);
  return context.model;
}