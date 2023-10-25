import { useEffect, useState } from 'react';
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
  
  const [isGuestUser, setIsGuestUser] = useState(true);
  const [isGamenightUser, setIsGamenightUser] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if(user.email.startsWith("admin"))
      setIsGuestUser(false);
    if(user.email.startsWith("gamenight"))
      setIsGamenightUser(true);
  }, []);

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
        { !isGuestUser && <NavLink title="Usuários" href={Routes.users}></NavLink> }
        { !isGuestUser && <NavLink title="Camisetas" href={Routes.tShirts}></NavLink>}
        {/* <NavLink title="Administradores" href={Routes.adminUsers}></NavLink> */}
        {/* <NavLink title="Conquistas" href={Routes.achievements}></NavLink> */}
        { !isGamenightUser && <NavLink title="Eventos" href={Routes.events}></NavLink>}
        { !isGuestUser && <NavLink title="Jogo - Perguntas" href={Routes.gameQuestions}></NavLink>}
        { !isGuestUser && <NavLink title="Jogo - Grupos" href={Routes.gameGroups}></NavLink>}
        { (!isGuestUser || isGamenightUser) && <NavLink title="Caça ao Tesouro" href={Routes.treasureHuntImages}></NavLink>}
        {/* <NavLink title="Logs" href={Routes.logs}></NavLink> */}
        { !isGuestUser && <NavLink title="Casas" href={Routes.houses}></NavLink>}
        {/* <NavLink title="Enviar Email" href={Routes.broadcastEmail}></NavLink> */}
        <button className="w-full bg-black text-white text-center py-3" onClick={handleLogout}>
          Sair
        </button>
      </Box>
    </Drawer>
  </>);
}

export default Sidebar;
