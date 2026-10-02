import { useState } from "react";
import { ImageOff } from "lucide-react";

// `picture_url` é uma URL livre cadastrada no backoffice (hoje, imgur) e a foto
// costuma ser o original em alta resolução. O imgur serve miniaturas trocando o
// sufixo do id ("l" = até 640px), então usamos isso na listagem e no modal;
// o original só é baixado no zoom. Qualquer outra URL passa intacta.
const IMGUR_URL = /^(https:\/\/i\.imgur\.com\/)([A-Za-z0-9]{5}|[A-Za-z0-9]{7})(\.(?:jpe?g|png))$/i;

function productThumbnailUrl(url: string): string {
  const match = IMGUR_URL.exec(url);
  return match ? `${match[1]}${match[2]}l${match[3]}` : url;
}

interface ProductImageProps {
  src: string;
  alt: string;
  // Classes extras da <img> (ex.: zoom no hover). A transição de opacidade é daqui.
  className?: string;
  // Imagem acima da dobra: baixa já, com prioridade alta, em vez de lazy.
  priority?: boolean;
}

// Ocupa o espaço do pai (que deve ter `relative` e dimensões próprias): mostra um
// skeleton enquanto a foto baixa e faz fade-in ao terminar.
export default function ProductImage({ src, alt, className = "", priority = false }: ProductImageProps) {
  const thumbnail = productThumbnailUrl(src);
  const [currentSrc, setCurrentSrc] = useState(thumbnail);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Troca de produto no mesmo <img> (ex.: modal reaberto) recomeça o ciclo de carregamento.
  if (currentSrc !== thumbnail && currentSrc !== src) {
    setCurrentSrc(thumbnail);
    setLoaded(false);
    setFailed(false);
  }

  const handleError = () => {
    // Miniatura indisponível: tenta o original antes de desistir.
    if (currentSrc !== src) {
      setCurrentSrc(src);
      return;
    }
    setFailed(true);
  };

  return (
    <>
      {!loaded && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 flex items-center justify-center bg-semcompMidLightBlue/20 dark:bg-white/10 ${failed ? "" : "animate-pulse"}`}
        >
          {failed && <ImageOff size={32} className="text-semcompDarkBlue/40 dark:text-semcompOffWhite/40" />}
        </div>
      )}
      {!failed && (
        <img
          src={currentSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={`h-full w-full object-cover transition-[opacity,transform] duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
        />
      )}
    </>
  );
}
