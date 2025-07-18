import React from 'react';
import {Redirect, Switch, Route} from 'react-router-dom';

import {withAuth, withNoAuth} from '../libs/auth-checker';

import Home from '../pages/home';
import Login from '../pages/login';
import Users from '../pages/users';
import AdminUsers from '../pages/admins';
import Achievements from '../pages/achievements';
import Events from '../pages/events';
import Donations from '../pages/donations';
import Points from '../pages/points';
import RiddleQuestions from '../pages/riddle-questions';
import RiddleGroups from '../pages/riddle-groups';
import RiddlethonQuestions from '../pages/riddlethon-questions';
import RiddlethonGroups from '../pages/riddlethon-groups';
import HardToClickQuestions from '../pages/hard-to-click-questions';
import HardToClickGroups from '../pages/hard-to-click-groups';
import BroadcastEmail from '../pages/broadcast-email';
import Logs from '../pages/logs';
import Houses from '../pages/houses';

/**
 * Contains all of your app's routes. Whenever you need to reroute the user to another
 * page, import this variable and use it to get the route string. Don't use the string
 * directly. Here's an example:
 * @example
 * // Wrong
 * history.push('/login');
 *
 * // Right
 * import { Routes } from '../router';
 * history.push(Routes.login);
*/
export const Routes = {
  home: '/',
  login: '/login',
  users: '/usuarios',
  adminUsers: '/administradores',
  achievements: '/conquistas',
  events: '/eventos',
  riddleQuestions: '/riddle-perguntas',
  riddleGroups: '/riddle-grupos',
  riddlethonQuestions: '/riddlethon-perguntas',
  riddlethonGroups: '/riddlethon-grupos',
  hardToClickQuestions: '/duro-de-clicar-perguntas',
  hardToClickGroups: '/duro-de-clicar-grupos',
  logs: '/logs',
  houses: '/casas',
  broadcastEmail: '/enviar-email',
  donations: '/doacoes',
  points: '/pontuacao',
};

/**
 * The main `Router` component of the app. This component is responsible for
 * rendering the correct component according to the user's current URL.
 *
 * @return {object}
 */
function Router() {
  return (
    <div style={{paddingTop: '72px'}}>
      {/* The `Switch` component will always only render a single `Route` component.
      In this case, it will render the `Route` component whose path matches the
      current path of the user.*/}
      <Switch>
        {/* `Route` components will only render their `component` prop if the user's
        URL matches the `path` prop. The `exact` prop is to make sure the user's
        URL has to perfectly match the `path` prop of the component.
        the `withAuth` and `withNoAuth` functions are described on their definition
        file. if you'd like to know what they do, visit that. */}
        <Route exact path={Routes.home} component={withAuth(Home)} />
        <Route exact path={Routes.users} component={withAuth(Users)} />
        <Route exact path={Routes.adminUsers} component={withAuth(AdminUsers)} />
        <Route exact path={Routes.achievements} component={withAuth(Achievements)} />
        <Route exact path={Routes.events} component={withAuth(Events)} />
        <Route exact path={Routes.riddleQuestions} component={withAuth(RiddleQuestions)} />
        <Route exact path={Routes.riddleGroups} component={withAuth(RiddleGroups)} />
        <Route exact path={Routes.riddlethonQuestions} component={withAuth(RiddlethonQuestions)} />
        <Route exact path={Routes.riddlethonGroups} component={withAuth(RiddlethonGroups)} />
        <Route exact path={Routes.hardToClickQuestions} component={withAuth(HardToClickQuestions)} />
        <Route exact path={Routes.hardToClickGroups} component={withAuth(HardToClickGroups)} />
        <Route exact path={Routes.logs} component={withAuth(Logs)} />
        <Route exact path={Routes.houses} component={withAuth(Houses)} />
        <Route exact path={Routes.broadcastEmail} component={withAuth(BroadcastEmail)} />
        <Route exact path={Routes.login} component={withNoAuth(Login)} />
        <Route exact path={Routes.donations} component={withAuth(Donations)} />
        <Route exact path={Routes.points} component={withAuth(Points)} />

        {/* Since the `Switch` only renders a single component, if all of the `Route`
        components above fail to render, this `Redirect` component will be rendered,
        redirecting the user to it's `to` prop. */}
        <Redirect to={Routes.home} />
      </Switch>
    </div>
  );
}

export default Router;
