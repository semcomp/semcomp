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
import AuthUSP from "../pages/auth-usp";
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
  authUsp: "/auth-usp",
  profile: "/profile",
  live: "/live",
};

function Router() {
  return (
    <Switch>
      <Route exact path={Routes.home} component={Home} />
      <Route exact path={Routes.login} component={withNoAuth(Login)} />
      {/* Note: the signup page CANNOT have a `withNoAuth` wrapper because, in the
			USP login step, after the user is redirected to '/auth-usp', the backend
			will send back a token in the 'authorization' header, which signal the
			front-end as if the user was logged in, but they won't have completed the
			whole signup yet, and if this page is wrapped inside `withNoAuth`, they
			will be redirected to the profile page without finishing the signup,
			breaking the whole app. */}
      <Route exact path={Routes.signup} component={Signup} />
      <Route exact path={Routes.authUsp} component={AuthUSP} />
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
