import React from 'react';

import {toast} from 'react-toastify';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';

import {Routes} from '../router';

/**
 * @param {object} user
 * @param {string} token
 *
 * @return {object}
 */
function isLoggedIn(user, token) {
  return Boolean(user && token);
}

/**
 * This is a higher order function for a component. It will get information through Redux
 * on which user is currently logged in. If the user is logged in, it will render
 * the component normaly, passing the `user` as a prop. If the user is not loged in,
 * it will redirect the user to the login page.
 *
 * This functions is the opposite of the `withNoAuth` function defined below.
 * These functions are supposed to be used inside the router to "lock" some pages
 * that should only be seen by logged in (or not logged in) users.
 *
 * @param {object} Component
 * @return {object}
 */
export function withAuth(Component) {
  return (props) => {
    const token = useSelector((state) => state.auth && state.auth.token);
    const user = useSelector((state) => state.auth && state.auth.user);
    const history = useHistory();

    if (!isLoggedIn(token, user)) {
      toast.error('Sua sessão expirou. Por favor, faça login novamente');
      // setTimeout is here to prevent changing state at a render function
      setTimeout(() => history.push(Routes.login));
      return null;
    }

    return <Component user={user} {...props} />;
  };
}

/**
 * This is a higher order function for a component. It will get information through Redux
 * on which user is currently logged in. If the user is logged in, it will redirect the user
 * to thir home page. If the user is not loged in, it will render the component normaly.
 *
 * This functions is the opposite of the `withAuth` function defined abore.
 * These functions are supposed to be used inside the router to "lock" some pages
 * that should only be seen by logged in (or not logged in) users.
 *
 * @param {object} Component
 *
 * @return {object}
 */
export function withNoAuth(Component) {
  return (props) => {
    const token = useSelector((state) => state.auth && state.auth.token);
    const user = useSelector((state) => state.auth && state.auth.user);
    const history = useHistory();

    if (isLoggedIn(token, user)) {
      // setTimeout is here to prevent changing state at a render function
      setTimeout(() => history.replace(Routes.home));
      return null;
    }

    return <Component user={user} {...props} />;
  };
}
