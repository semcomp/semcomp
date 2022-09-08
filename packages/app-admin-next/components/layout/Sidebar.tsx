import { useState } from 'react';
import Link from 'next/link';

import Drawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import Routes from '../../routes';
import SemcompLogo from '../../assets/semcomp-logo-textless.png';
import { useAppContext } from '../../libs/contextLib';

/** Tailwind styles. */
const style = {
  main: 'flex flex-col items-center shadow-lg',
  logo: 'w-8 mx-4 my-auto',
  nav: 'flex flex-col w-full border-t border-gray-400',
  button: 'border-b text-center w-full py-2 border-gray-400',
};

const drawerWidth = 192;

const AppBar = styled(MuiAppBar as any, {
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
  const { logOut } = useAppContext();

  const [open, setOpen] = useState(false);

  const handleToggleSidebar = () => {
    setOpen(!open);
  };

  /**
   * handleLogout
   */
  function handleLogout() {
    logOut();
  }

  return (
    <>
      <header>
        <AppBar position="fixed" open={open} color="default">
          <Toolbar>
            <IconButton
              color="inherit"
              onClick={handleToggleSidebar}
              edge="start"
              sx={{ ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <Link href={Routes.home}>
              <img className={style.logo} src={SemcompLogo.src} alt="semcomp logo" />
            </Link>
          </Toolbar>
        </AppBar>
      </header>
      <Drawer variant="persistent" anchor="left" open={open}>
        <nav className={style.nav}>
          <Link href={Routes.users}>
            <span onClick={handleToggleSidebar} className={style.button}>
              Usuários
            </span>
          </Link>
          <Link href={Routes.adminUsers}>
            <span onClick={handleToggleSidebar} className={style.button}>
              Administradores
            </span>
          </Link>
          {/* <Link className={style.button} onClick={handleToggleSidebar} href={Routes.achievements}>Conquistas</Link> */}
          <Link href={Routes.events}>
            <span onClick={handleToggleSidebar} className={style.button}>
              Eventos
            </span>
          </Link>
          {/* <Link className={style.button} onClick={handleToggleSidebar} href={Routes.riddleQuestions}>Riddle - Perguntas</Link> */}
          {/* <Link className={style.button} onClick={handleToggleSidebar} href={Routes.riddleGroups}>Riddle - Grupos</Link> */}
          <Link href={Routes.riddlethonQuestions}>
            <span onClick={handleToggleSidebar} className={style.button}>
              Riddlethon - Perguntas
            </span>
          </Link>
          <Link href={Routes.riddlethonGroups}>
            <span onClick={handleToggleSidebar} className={style.button}>
              Riddlethon - Grupos
            </span>
          </Link>
          <Link href={Routes.hardToClickQuestions}>
            <span onClick={handleToggleSidebar} className={style.button}>
              Duro de Clicar - Perguntas
            </span>
          </Link>
          <Link href={Routes.hardToClickGroups}>
            <span onClick={handleToggleSidebar} className={style.button}>
              Duro de Clicar - Grupos
            </span>
          </Link>
          <Link href={Routes.logs}>
            <span onClick={handleToggleSidebar} className={style.button}>
              Logs
            </span>
          </Link>
          {/* <Link className={style.button} onClick={handleToggleSidebar} href={Routes.houses}>Casas</Link> */}
          <Link href={Routes.broadcastEmail}>
            <span onClick={handleToggleSidebar} className={style.button}>
              Enviar Email
            </span>
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
