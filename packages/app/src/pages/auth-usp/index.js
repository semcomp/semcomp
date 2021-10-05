import React from "react";

import { useHistory } from "react-router-dom";

import { Routes } from "../../router";
import API from "../../api";
import {
  setUser as setUserAction,
  setToken as setTokenAction,
} from "../../redux/actions/auth";
import { useDispatch } from "react-redux";

function AuthUSPPage() {
  const history = useHistory();
  const dispatch = useDispatch();

  async function fetchPossibleUser() {
    try {
      const response = await API.loginUsp();

      // The 'isSignup' variable determines whether the user just logged in or is doing a signup.
      // If this is a login, the user data will be available inside the `user` variable.
      // If this is a signup, the `user` variable should be empty.
      const { isSignup, token, success, ...user } = response.data;

      if (isSignup) history.push(Routes.signup + "#" + token);
      else {
        dispatch(setTokenAction(token));
        dispatch(setUserAction(user));
        history.push(Routes.home);
      }
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => {
    fetchPossibleUser();
  }, []);

  return null;
}

export default AuthUSPPage;
