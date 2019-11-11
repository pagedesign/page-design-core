import React from "react";

import { HashRouter, Switch, Route, NavLink, Redirect } from "react-router-dom";

import Basic from "./basic";
import FormDesigner from "./form-designer";
import SortList from "./sort-list";
import SortListAnimation from "./sort-list-animation";
import DragLayer from "./drag-layer";
import TodoList from "./todo-list";
import PivotTable1 from "./pivot-table-01";
import PivotTable2 from "./pivot-table-02";
import NativeFiels from "./native-files";

import "./style/index.scss";

export default () => {
    return (
        <HashRouter>
            <div className="app-demo">
                <div className="left-nav">
                    <NavLink to="/form-designer">表单设计器</NavLink>
                    <NavLink to="/todo-list">TodoList</NavLink>
                    <NavLink to="/pivot-table-01">多维分析</NavLink>
                    <NavLink to="/pivot-table-02">数据透视</NavLink>
                    <NavLink to="/sort-list">列表排序</NavLink>
                    <NavLink to="/sort-list-animation">
                        列表排序(动画效果)
                    </NavLink>
                    <NavLink to="/drag-layer">自定义推拽层</NavLink>
                    <NavLink to="/native-files">本地文件</NavLink>
                    <NavLink to="/basic">其他</NavLink>
                </div>
                <div className="container">
                    <Switch>
                        <Route
                            path="/"
                            exact
                            render={() => <Redirect to="/form-designer" />}
                        />
                        <Route path="/form-designer" component={FormDesigner} />
                        <Route path="/basic" component={Basic} />
                        <Route path="/sort-list" component={SortList} />
                        <Route path="/todo-list" component={TodoList} />
                        <Route
                            path="/sort-list-animation"
                            component={SortListAnimation}
                        />
                        <Route path="/drag-layer" component={DragLayer} />
                        <Route path="/pivot-table-01" component={PivotTable1} />
                        <Route path="/pivot-table-02" component={PivotTable2} />
                        <Route path="/native-files" component={NativeFiels} />
                    </Switch>
                </div>
            </div>
        </HashRouter>
    );
};
