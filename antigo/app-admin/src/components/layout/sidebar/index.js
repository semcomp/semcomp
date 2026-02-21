import React from 'react';

import { Link, useHistory } from 'react-router-dom';
import Drawer from '@material-ui/core/Drawer';
import { styled } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import { Routes } from '../../../router';
import { logout as logoutAction } from '../../../redux/actions/auth';
import { useDispatch } from 'react-redux';

import SemcompLogo from '../../../assets/semcomp-logo-textless.png';

/** Tailwind styles. */
const style = {
  main: 'flex flex-col items-center shadow-lg',
  logo: 'w-8 mx-4 my-auto',
  nav: 'flex flex-col w-full border-t border-gray-400',
  button: 'border-b text-center w-full py-2 border-gray-400',
};

const drawerWidth = 192;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

/**
 * @return {object}
 */
function Sidebar() {
  const dispatch = useDispatch();
  const history = useHistory();

  const [open, setOpen] = React.useState(false);

  const handleToggleSidebar = () => {
    setOpen(!open);
  };

  /**
   * handleLogout
   */
  function handleLogout() {
    // Logs the user out.
    dispatch(logoutAction());

    // Sends the user to the login page.
    history.push(Routes.login);
  }

  return (
    <>
      <header>
        <AppBar position="fixed" open={open} color="white">
          <Toolbar>
            <IconButton
              color="inherit"
              onClick={handleToggleSidebar}
              edge="start"
              sx={{ ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <Link to={Routes.home}>
              <img className={style.logo} src={SemcompLogo} alt="semcomp logo" />
            </Link>
          </Toolbar>
        </AppBar>
      </header>
      <Drawer variant="persistent" anchor="left" open={open}>
        <nav className={style.nav}>
          <Link className={style.button} onClick={handleToggleSidebar} to={Routes.users}>
            Usuários
          </Link>
          <Link className={style.button} onClick={handleToggleSidebar} to={Routes.adminUsers}>
            Administradores
          </Link>
          {/* <Link className={style.button} onClick={handleToggleSidebar} to={Routes.achievements}>Conquistas</Link> */}
          <Link className={style.button} onClick={handleToggleSidebar} to={Routes.events}>
            Eventos
          </Link>
          {/* <Link className={style.button} onClick={handleToggleSidebar} to={Routes.riddleQuestions}>Riddle - Perguntas</Link> */}
          {/* <Link className={style.button} onClick={handleToggleSidebar} to={Routes.riddleGroups}>Riddle - Grupos</Link> */}
          <Link className={style.button} onClick={handleToggleSidebar} to={Routes.riddlethonQuestions}>
            Riddlethon - Perguntas
          </Link>
          <Link className={style.button} onClick={handleToggleSidebar} to={Routes.riddlethonGroups}>
            Riddlethon - Grupos
          </Link>
          <Link className={style.button} onClick={handleToggleSidebar} to={Routes.hardToClickQuestions}>
            Duro de Clicar - Perguntas
          </Link>
          <Link className={style.button} onClick={handleToggleSidebar} to={Routes.hardToClickGroups}>
            Duro de Clicar - Grupos
          </Link>
          <Link className={style.button} onClick={handleToggleSidebar} to={Routes.logs}>
            Logs
          </Link>
          {/* <Link className={style.button} onClick={handleToggleSidebar} to={Routes.houses}>Casas</Link> */}
          <Link className={style.button} onClick={handleToggleSidebar} to={Routes.broadcastEmail}>
            Enviar Email
          </Link>
          <button className={style.button} onClick={handleLogout}>
            Sair
          </button>
        </nav>
      </Drawer>
    </>
  );
}

export default Sidebar;
