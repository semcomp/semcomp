import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "semcomp-theme";

export default function RouteLoading() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsDarkMode(window.localStorage.getItem(THEME_STORAGE_KEY) !== "light");
  }, []);

  const bgGradient = isDarkMode
    ? "bg-linear-to-br from-semcompDarkBlue via-semcompAlmostDarkBlue to-semcompMidDarkBlue"
    : "bg-linear-to-br from-semcompLightBlue/20 via-semcompOffWhite to-semcompLightBlue/30";

  const orbTop = isDarkMode ? "bg-semcompLightBlue/10" : "bg-semcompLightBlue/20";
  const orbBottom = isDarkMode ? "bg-semcompMidLightBlue/10" : "bg-semcompMidLightBlue/15";

  const card = isDarkMode
    ? "border-semcompMidLightBlue/20 bg-semcompDarkBlue/45 shadow-[0_8px_32px_0_rgba(5,12,24,0.45)]"
    : "border-white/40 bg-white/40 shadow-[0_8px_32px_0_rgba(15,103,177,0.1)]";

  const titleColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompMidDarkBlue";
  const ringBase = isDarkMode ? "border-semcompLightBlue/20" : "border-semcompMidLightBlue/20";
  const ringAccent = isDarkMode ? "border-t-semcompLightBlue" : "border-t-semcompMidDarkBlue";
  const pingDot = isDarkMode ? "bg-semcompLightBlue" : "bg-semcompMidDarkBlue";
  const skeletonBase = isDarkMode ? "bg-semcompMidLightBlue/15" : "bg-semcompMidLightBlue/10";
  const shimmer = isDarkMode ? "via-semcompLightBlue/30" : "via-white/50";
  const badge = isDarkMode
    ? "bg-semcompMidLightBlue/15 text-semcompLightBlue/70"
    : "bg-semcompMidLightBlue/10 text-semcompMidDarkBlue/50";

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden px-4 py-12">
      <div className={`absolute inset-0 ${bgGradient} animate-pulse animation-duration-[5s]`} />
    
      <div className={`absolute -top-24 -left-24 h-64 w-64 rounded-full ${orbTop} blur-3xl`} />
      <div className={`absolute -bottom-24 -right-24 h-64 w-64 rounded-full ${orbBottom} blur-3xl`} />

      <div className="relative w-full max-w-md transform transition-all duration-500 hover:scale-[1.01]">
        <div className={`overflow-hidden rounded-[2rem] border p-8 backdrop-blur-md ${card}`}>
          
          <div className="mb-8 flex items-center gap-5"> 
            <div className="relative flex h-12 w-12 items-center justify-center">
              <div className={`absolute h-full w-full rounded-full border-4 ${ringBase}`} />
              <div className={`absolute h-full w-full animate-spin rounded-full border-4 border-transparent ${ringAccent} shadow-inner`} />
              <div className={`h-2 w-2 animate-ping rounded-full ${pingDot}`} />
            </div>
            
            <div>
              <h3 className={`font-poppins text-xl font-bold tracking-tight ${titleColor}`}>
                Quase lá...
              </h3>
            </div>
          </div>

          {/* Skeleton Loaders Estilizados */}
          <div className="space-y-4">
            <div className={`relative h-4 w-full overflow-hidden rounded-lg ${skeletonBase}`}>
              <div className={`absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent ${shimmer} to-transparent`} />
            </div>
            <div className={`relative h-4 w-5/6 overflow-hidden rounded-lg ${skeletonBase}`}>
              <div className={`absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-linear-to-r from-transparent ${shimmer} to-transparent`} />
            </div>
            <div className={`relative h-4 w-4/6 overflow-hidden rounded-lg ${skeletonBase}`}>
              <div className={`absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-linear-to-r from-transparent ${shimmer} to-transparent`} />
            </div>
          </div>

          {/* Badge de Progresso Discreta */}
          <div className="mt-8 flex justify-center">
             <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${badge}`}>
               Semcomp 2026
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}