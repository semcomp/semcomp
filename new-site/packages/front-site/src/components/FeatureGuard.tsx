import { Navigate, Outlet } from "react-router-dom";
import type { FeatureKey } from "@/types/FeatureKeyType";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";

interface FeatureGuardProps {
  featureKey: FeatureKey;
}

export default function FeatureGuard({ featureKey }: FeatureGuardProps) {
  const { isFeatureEnabled, isLoading } = useFeatureFlags();

  // Mostra uma tela de carregamento enquanto busca as configurações do banco
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  // Se a funcionalidade estiver desativada, redireciona para a Home
  if (!isFeatureEnabled(featureKey)) {
    return <Navigate to="/" replace />;
  }

  // Se estiver ativa, renderiza a rota filha
  return <Outlet />;
}