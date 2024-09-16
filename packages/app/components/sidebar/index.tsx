import { useEffect, useState } from 'react';
import Link from 'next/link';
import Drawer from '@mui/material/Drawer';
import { ThemeProvider, styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Box, Divider } from '@mui/material'; // Importar Divider

import Routes from '../../routes';
import SemcompLogo from '../../assets/27-imgs/logo.svg';
import { useAppContext } from '../../libs/contextLib';
import { useRouter } from 'next/router';
import { createTheme } from '@mui/material/styles';
import Modal from '../home/Modal'; // Importar o Modal

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E1B5B',
    },
  },
});

function NavLink({ title, href }) {
  return (
    <Link href={href}>
      <div className="hover:cursor-pointer hover:bg-[#ECECEC] w-full border-b border-gray-300 text-center py-3 text-lg font-secondary">
        {title}
      </div>
    </Link>
  );
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

function Sidebar(props) {
  const { user } = useAppContext();
  const router = useRouter();
  const isUserLoggedIn = Boolean(user);

  const [isOpen, setIsOpen] = useState(false);
  const [buttonSelected, setButtonSelected] = useState(''); // Estado para controlar o modal

  function logUserOut() {
    router.push(Routes.home);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Funções para abrir o modal de "Sobre nós" e "Cronograma"
  function handleSobre() {
    setButtonSelected('sobre');
  }

  function handleCronograma() {
    setButtonSelected('cronograma');
  }

  return (
    <>
      <div className={'md:hidden mobile:flex'}>
        <header>
          <AppBar position="fixed" id={props.id} open={isOpen} color="default">
            <Toolbar>
              <ThemeProvider theme={theme}>
                <IconButton
                  color="primary"
                  style={{ outline: 'none' }}
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
          className="font-secondary"
        >
          <Box
            sx={{ width: drawerWidth }}
            className="flex flex-col items-center justify-center h-full"
            onClick={() => setIsOpen(false)}
            onKeyDown={() => setIsOpen(false)}
          >
            {/* Botões "Sobre nós" e "Cronograma" centralizados */}
            <button
              onClick={handleSobre}
              className="mx-4 text-lg cursor-pointer nav-link font-secondary py-3 hover:bg-[#ECECEC] focus:outline-none w-full text-center"
            >
              Sobre nós
            </button>
            
            {/* Divider abaixo do botão "Sobre nós" */}
            <Divider className="w-full" />

            <button
              onClick={handleCronograma}
              className="mx-4 text-lg cursor-pointer nav-link font-secondary py-3 hover:bg-[#ECECEC] focus:outline-none w-full text-center"
            >
              Cronograma
            </button>
            {isUserLoggedIn ? (
              <>
                <NavLink title="Perfil" href={Routes.profile + '#about'} />
                <button className="w-full py-3 text-center text-white bg-primary" onClick={logUserOut}>
                  Sair
                </button>
              </>
            ) : (
              <NavLink title="Entrar" href={Routes.login} />
            )}
          </Box>
        </Drawer>
      </div>

      {/* Exibição do modal */}
      {buttonSelected !== '' && (
        <Modal setButtonSelected={setButtonSelected} element={buttonSelected} />
      )}
    </>
  );
}

export default Sidebar;