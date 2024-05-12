import { useEffect, useState } from 'react';
import Link from 'next/link';

import Drawer from '@mui/material/Drawer';
import { ThemeProvider, styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Box } from '@mui/material';

import Routes from '../../routes';
import SemcompLogo from '../../assets/27-imgs/logo.svg';
import { useAppContext } from '../../libs/contextLib';
import { useRouter } from 'next/router';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E1B5B'
    }, 
  },
});

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
    const { user } = useAppContext();
    const router = useRouter();
    const isUserLoggedIn = Boolean(user);

    const [isOpen, setIsOpen] = useState(false);

    function logUserOut() {
        router.push(Routes.home);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    return (<div className={"md:hidden mobile:flex"}>
        <header>
        <AppBar position="fixed" style={{ backgroundColor: 'transparent', boxShadow: 'none' }} open={isOpen} color="default">
            <Toolbar style={{ backgroundColor: 'transparent' }}>
            <ThemeProvider theme={theme}>
              <IconButton
                  color="primary"
                  style={{ outline: "none" }}
                  onClick={() => setIsOpen(true)}
                  edge="start"
                  sx={{ ...(isOpen && { display: 'none' }) }}
              >
                  <MenuIcon />
              </IconButton>
            </ThemeProvider>
              <Link href={Routes.home}>
                  <img className="w-8 my-auto mr-2" src={SemcompLogo.src} alt="semcomp logo" />
              </Link>
            </Toolbar>
        </AppBar>
        </header>
        <Drawer
        anchor="left"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className='font-secondary'
        >
            <Box
            sx={{ width: drawerWidth }}
            onClick={() => setIsOpen(false)}
            onKeyDown={() => setIsOpen(false)}
            >
                <NavLink title="Sobre nós" href={Routes.home + "#about"}></NavLink>
                <NavLink title="Cronograma" href={Routes.home + "#schedule"}></NavLink>
                {isUserLoggedIn ? (
                      <>
                        <NavLink title="Perfil" href={Routes.profile + "#about"}></NavLink>
                        <button className="w-full bg-primary text-white text-center py-3" onClick={logUserOut}>
                        Sair
                        </button>
                      </>)
                    : 
                    <NavLink title="Entrar" href={Routes.login}></NavLink>
                
                }
                
            </Box>
        </Drawer>
    </div>);
}

export default Sidebar;
