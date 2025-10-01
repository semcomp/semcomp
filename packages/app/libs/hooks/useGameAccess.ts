import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import API from '../../api';
import { toast } from 'react-toastify';

interface GameAccessReturn {
  isGameOpen: boolean;
  isLoading: boolean;
  redirectToProfile: () => void;
}

export function useGameAccess(): GameAccessReturn {
  const [isGameOpen, setIsGameOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkGameAccess() {
      try {
        const result = await API.config.getConfig();
        if (result.data) {
          setIsGameOpen(result.data.openGames || false);
          
          // Se os jogos não estão abertos, redireciona para o perfil
          if (!result.data.openGames) {
            toast.error("Os jogos estão desativados no momento. Tente novamente mais tarde.");
            router.push('/profile');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar acesso aos jogos:', error);
        // Em caso de erro, assume que os jogos estão fechados por segurança
        setIsGameOpen(false);
        router.push('/profile');
      } finally {
        setIsLoading(false);
      }
    }

    checkGameAccess();
  }, [router]);

  const redirectToProfile = () => {
    router.push('/profile');
  };

  return {
    isGameOpen,
    isLoading,
    redirectToProfile
  };
} 