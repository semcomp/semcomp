import { useRouter } from 'next/router';
import { Button } from "@mui/material";
import { ErrorOutline, Refresh, Home } from "@mui/icons-material";
import themeColors from '../../styles/themeColors';

interface GameConfigErrorProps {
  onRetry?: () => void;
}

export default function GameConfigError({ onRetry }: GameConfigErrorProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <ErrorOutline className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">Ops! Algo deu errado</h1>
        <p className="text-gray-600 mb-6">Não foi possível carregar a configuração do jogo. Isso pode acontecer quando:</p>
        <ul className="text-left text-gray-600 mb-6 space-y-2">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
            O jogo não existe ou foi removido
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
            Há problemas temporários de conexão
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
            O link pode estar incorreto
          </li>
        </ul>
      </div>
      <div className="space-y-3">
        <Button
          variant="contained"
          onClick={handleRetry}
          startIcon={<Refresh />}
          className="w-full py-3 text-lg font-bold rounded-lg"
          sx={{
            backgroundColor: themeColors.primary,
            '&:hover': {
              backgroundColor: themeColors.hoverPrimary,
            }
          }}
        >
          Tentar Novamente
        </Button>
        <Button
          variant="outlined"
          onClick={() => router.push('/')}
          startIcon={<Home />}
          className="w-full py-2 text-base rounded-lg"
          sx={{
            borderColor: themeColors.primary,
            color: themeColors.primary,
            '&:hover': {
              borderColor: themeColors.hoverPrimary,
              backgroundColor: `${themeColors.primary}10`,
            }
          }}
        >
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}
