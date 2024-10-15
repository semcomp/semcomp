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

function findRole(adminRole: Array<String>, page: String) {
  if(adminRole){
    return adminRole.find((s:String) => s === page);
  }

  return false;
}

function Sidebar() {
  const { adminRole } = useAppContext();
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
      { adminRole && adminRole.length !== 0 ? (
          <Box
          sx={{ width: drawerWidth }}
          onClick={() => setIsOpen(false)}
          onKeyDown={() => setIsOpen(false)}
          >
            { findRole(adminRole, 'USERS') 
              && <NavLink title="Usuários" href={Routes.users}></NavLink> }
            { findRole(adminRole, 'TSHIRTS') 
              && <NavLink title="Camisetas" href={Routes.tShirts}></NavLink>}
            { findRole(adminRole, 'SALES')
              && <NavLink title="Vendas" href={Routes.sales}></NavLink>}
            { findRole(adminRole, 'PAYMENTS')
              && <NavLink title="Pagamentos" href={Routes.payments}></NavLink> }
            { findRole(adminRole, 'GAMECONFIG')
              && <NavLink title="Jogos" href={Routes.games}></NavLink>}
            { findRole(adminRole, 'GAMEQUESTIONS') 
              && <NavLink title="Jogo - Perguntas" href={Routes.gameQuestions}></NavLink>}
            { findRole(adminRole, 'GAMEGROUPS') 
              && <NavLink title="Jogo - Grupos" href={Routes.gameGroups}></NavLink>}
            { findRole(adminRole, 'HOUSES') 
              &&  <NavLink title="Casas" href={Routes.houses}></NavLink>}
            { findRole(adminRole, 'EVENTS') 
              && <NavLink title="Eventos" href={Routes.events}></NavLink>}
            { findRole(adminRole, 'TREASUREHUNTIMAGES') 
              && <NavLink title="Caça ao Tesouro" href={Routes.treasureHuntImages}></NavLink>}
            { findRole(adminRole, 'ADMINUSERS') &&
              <NavLink title="Administradores" href={Routes.adminUsers}></NavLink>}
            { findRole(adminRole, 'CONFIG') &&
              <NavLink title="Configurações" href={Routes.configuration}></NavLink>}
            { findRole(adminRole, 'ACHIEVEMENTS') &&
              <NavLink title="Conquistas" href={Routes.achievements}></NavLink> }
            {/* adminRole === 0 && <NavLink title="Logs" href={Routes.logs}></NavLink> */}
            {/* adminRole === 0 && <NavLink title="Enviar Email" href={Routes.broadcastEmail}></NavLink> */}
            <button className="w-full bg-black text-white text-center py-3" onClick={handleLogout}>
              Sair
            </button>
          </Box>
        ) 
      :
        (<Box
          sx={{ width: drawerWidth }}
          onClick={() => setIsOpen(false)}
          onKeyDown={() => setIsOpen(false)}
          >
            <div className='h-fit my-4'>
              <p className='max-w-xl text-center p-4'>Suas permissões não estão definidas, peça para que o administrador adicione-as.</p>
            </div>
            <button className="w-full bg-black text-white text-center py-3" onClick={handleLogout}>
              Sair
            </button>
        </Box>)
      }
    </Drawer>
  </>);
}

export default Sidebar;
