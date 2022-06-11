import React from "react";
import { Redirect, Switch, Route } from "react-router-dom";

import { withAuth, withNoAuth } from "../libs/auth-checker";

import Home from "../pages/home";
import Login from "../pages/login";
import Signup from "../pages/signup";
// import Riddle from '../pages/riddle';
import Riddlethon from '../pages/riddlethon';
import ResetPassword from "../pages/reset-password";
import Sponsors from "../pages/sponsors";
import Profile from "../pages/profile";
import HardToClick from '../pages/hard-to-click';
import Livestream from "../pages/livestream";

export const Routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  resetPassword: "/reset-password",
  // riddle: '/riddle',
  riddlethon: '/riddlethon',
  hardToClick: '/duro-de-clicar',
  sponsors: "/sponsors",
  profile: "/profile",
  live: "/live",
};

function Router() {
  return (
    <Switch>
      <Route exact path={Routes.home} component={Home} />
      <Route exact path={Routes.login} component={withNoAuth(Login)} />
      <Route exact path={Routes.signup} component={Signup} />
      <Route exact path={Routes.resetPassword} component={ResetPassword} />
      <Route exact path={Routes.sponsors} component={Sponsors} />
      {/* <Route path={Routes.riddle} component={withAuth(Riddle)} /> */}
			<Route path={Routes.riddlethon} component={withAuth(Riddlethon)} />
			<Route path={Routes.hardToClick} component={withAuth(HardToClick)} />
      <Route exact path={Routes.profile} component={withAuth(Profile)} />
      <Route exact path={Routes.live} component={Livestream} />

      <Redirect to={Routes.home} />
    </Switch>
  );
}

export default Router;
