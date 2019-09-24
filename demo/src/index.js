import React from "react";

import { HashRouter, Switch, Route, NavLink, Redirect } from "react-router-dom";

import Basic from "./basic";
import SortList from "./sort-list";

import "./style/index.scss";

export default () => {
    return (
        <HashRouter>
            <div className="app-demo">
                <div className="left-nav">
                    <NavLink to="/basic">demo1</NavLink>
                    <NavLink to="/sort-list">Demo2</NavLink>
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
                    </Switch>
                </div>
            </div>
        </HashRouter>
    );
};
