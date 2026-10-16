import { useState, useEffect } from "react";
import { sponsorsAPI, getSponsorImageUrl, recordSponsorClick } from "@/api/sponsors";
import type { Sponsor } from "@/api/sponsors";
import { useTheme } from "@/contexts/useTheme";
import LogoLoop from "@/components/ui/LogoLoop";
import { buildLogoImgClassName } from "@/components/ui/logoClasses";

const GRID_THRESHOLD = 4;

/** Aceita o site com ou sem protocolo e devolve uma URL absoluta navegável. */
const toWebsiteUrl = (website: string) =>
  /^https?:\/\//i.test(website) ? website : `https://${website}`;

const PatrocinadoresSection = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    sponsorsAPI
      .getAll()
      .then((data) => setSponsors(data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || sponsors.length === 0) return null;

  const backgroundColorBack = isDarkMode ? "#0F486D" : "#2c6e94";

  return (
    <section className="w-full overflow-hidden" style={{ backgroundColor: backgroundColorBack }}>
      <div className="w-full py-4 px-4 sm:px-8 lg:px-16 bg-semcompMidLightBlue dark:bg-semcompMidDarkBlue">
        <h2 className="font-poppins text-center text-xl sm:text-2xl text-semcompLightBlue dark:text-semcompOffWhite">
          Nossos Patrocinadores
        </h2>
      </div>

      <div className="py-10">
        {sponsors.length < GRID_THRESHOLD ? (
          <div className="flex flex-wrap items-center justify-center gap-10 px-8">
            {sponsors.map((sp) => (
              <a
                key={sp.cnpj}
                href={toWebsiteUrl(sp.website)}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => recordSponsorClick(sp.cnpj)}
                title={sp.name}
                aria-label={`Visitar site de ${sp.name}`}
                className="group flex items-center justify-center focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-2"
              >
                <img
                  src={getSponsorImageUrl(sp.logo)}
                  alt={sp.name}
                  className={`h-16 w-auto max-w-[160px] ${buildLogoImgClassName(isDarkMode)}`}
                />
              </a>
            ))}
          </div>
        ) : (
          <LogoLoop
            logos={sponsors.map((sp) => ({
              src: getSponsorImageUrl(sp.logo),
              alt: sp.name,
              title: sp.name,
              href: toWebsiteUrl(sp.website),
              onClick: () => recordSponsorClick(sp.cnpj),
            }))}
            speed={80}
            direction="left"
            logoHeight={100}
            logoWidth={180}
            gap={72}
            hoverSpeed={0}
            fadeOut
            fadeOutColor={backgroundColorBack}
            isDarkMode={isDarkMode}
            ariaLabel="Patrocinadores da SEMCOMP"
          />
        )}
      </div>
    </section>
  );
};

export default PatrocinadoresSection;
