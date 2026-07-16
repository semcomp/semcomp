import { createContext, useContext, useEffect, useState } from "react";
import type { FeatureKey } from "@/types/FeatureKeyType";
import { pagesAPI } from "@/api/pages";

type FeatureFlags = Record<FeatureKey, boolean>;

interface FeatureFlagsContextType {
  features: FeatureFlags;
  isLoading: boolean;
  isFeatureEnabled: (key: FeatureKey) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(
  undefined
);

// Estado inicial padrão caso a requisição falhe ou esteja carregando
const defaultFlags: FeatureFlags = {
  home: true,
  login: true,
  cronograma: true,
  profile: true,
  riddle: true,
};

export function FeatureFlagsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [features, setFeatures] = useState<FeatureFlags>(defaultFlags);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatures() {
      try {
        const data = await pagesAPI.getAllAvailability();

        // Garante que a home sempre estará ativa por segurança
        setFeatures({ ...defaultFlags, ...data, home: true });
      } catch (error) {
        console.error("Erro ao buscar configurações das abas:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeatures();
  }, []);

  const isFeatureEnabled = (key: FeatureKey) => {
    return features[key] ?? true;
  };

  return (
    <FeatureFlagsContext.Provider
      value={{ features, isLoading, isFeatureEnabled }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlags deve ser usado dentro de um FeatureFlagsProvider"
    );
  }
  return context;
}
