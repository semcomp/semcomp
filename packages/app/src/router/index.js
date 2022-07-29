import React from "react";
import { Navigate, Routes as RoutesRRD, Route } from "react-router-dom";

import { RequireAuth, RequireNoAuth } from "../libs/auth-checker";

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
    <RoutesRRD>
      <Route path={Routes.home} element={<Home />} />
      <Route
          path={Routes.login}
          element={
            <RequireNoAuth>
              <Login />
            </RequireNoAuth>
          }
      />
      <Route path={Routes.signup} element={<Signup />} />
      <Route path={Routes.resetPassword} element={<ResetPassword />} />
      <Route path={Routes.sponsors} element={<Sponsors />} />
      {/* <Route
          path={Routes.riddle}
          element={
            <RequireAuth>
              <Riddle />
            </RequireAuth>
          }
      /> */}
      <Route
          path={Routes.riddlethon}
          element={
            <RequireAuth>
              <Riddlethon />
            </RequireAuth>
          }
      />
      <Route
          path={Routes.hardToClick}
          element={
            <RequireAuth>
              <HardToClick />
            </RequireAuth>
          }
      />
      <Route
          path={Routes.profile}
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
      />
      <Route path={Routes.live} element={<Livestream />} />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </RoutesRRD>
  );
}

export default Router;
