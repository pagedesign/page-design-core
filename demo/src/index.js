import React from "react";

import { HashRouter, Switch, Route, NavLink, Redirect } from "react-router-dom";

import Basic from "./basic";
import SortList from "./sort-list";
import SortListAnimation from "./sort-list-animation";
import DragLayer from "./drag-layer";
import TodoList from "./todo-list";

import "./style/index.scss";

export default () => {
    return (
        <HashRouter>
            <div className="app-demo">
                <div className="left-nav">
                    <NavLink to="/basic">基本功能</NavLink>
                    <NavLink to="/sort-list">列表排序</NavLink>
                    <NavLink to="/sort-list-animation">
                        列表排序(动画效果)
                    </NavLink>
                    <NavLink to="/drag-layer">自定义推拽层</NavLink>
                    <NavLink to="/todo-list">TodoList</NavLink>
                </div>
                <div className="container">
                    <Switch>
                        <Route
                            path="/"
                            exact
                            render={() => <Redirect to="/basic" />}
                        />
                        <Route path="/basic" component={Basic} />
                        <Route path="/sort-list" component={SortList} />
                        <Route path="/todo-list" component={TodoList} />
                        <Route
                            path="/sort-list-animation"
                            component={SortListAnimation}
                        />
                        <Route path="/drag-layer" component={DragLayer} />
                    </Switch>
                </div>
            </div>
        </HashRouter>
    );
};
