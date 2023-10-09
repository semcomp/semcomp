import { useState } from 'react';
import Link from 'next/link';

import Drawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Box } from '@mui/material';

import Routes from '../../routes';
import SemcompLogo from '../../assets/semcomp-logo-textless.png';
import { useAppContext } from '../../libs/contextLib';

function NavLink({title, href}) {
  return (<Link href={href}>
    <div className="hover:cursor-pointer hover:bg-[#ECECEC] w-full border-b border-gray-300 text-center py-3">
      {title}
    </div>
  </Link>);
}

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

function Sidebar() {
  const { logOut } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);

  function handleLogout() {
    logOut();
  }

  return (<>
    <header>
      <AppBar position="fixed" open={isOpen} color="default">
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setIsOpen(true)}
            edge="start"
            sx={{ ...(isOpen && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Link href={Routes.home}>
            <img className="w-8 mx-4 my-auto" src={SemcompLogo.src} alt="semcomp logo" />
          </Link>
        </Toolbar>
      </AppBar>
    </header>
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <Box
        sx={{ width: drawerWidth }}
        onClick={() => setIsOpen(false)}
        onKeyDown={() => setIsOpen(false)}
      >
        <NavLink title="Usuários" href={Routes.users}></NavLink>
        <NavLink title="Camisetas" href={Routes.tShirts}></NavLink>
        {/* <NavLink title="Administradores" href={Routes.adminUsers}></NavLink> */}
        {/* <NavLink title="Conquistas" href={Routes.achievements}></NavLink> */}
        <NavLink title="Eventos" href={Routes.events}></NavLink>
        <NavLink title="Jogo - Perguntas" href={Routes.gameQuestions}></NavLink>
        <NavLink title="Jogo - Grupos" href={Routes.gameGroups}></NavLink>
        {/* <NavLink title="Logs" href={Routes.logs}></NavLink> */}
        <NavLink title="Casas" href={Routes.houses}></NavLink>
        {/* <NavLink title="Enviar Email" href={Routes.broadcastEmail}></NavLink> */}
        <button className="w-full bg-black text-white text-center py-3" onClick={handleLogout}>
          Sair
        </button>
      </Box>
    </Drawer>
  </>);
}

export default Sidebar;
