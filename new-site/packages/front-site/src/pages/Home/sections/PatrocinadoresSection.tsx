import { useState, useEffect } from "react";
import { sponsorsAPI, getSponsorImageUrl, recordSponsorClick } from "@/api/sponsors";
import type { Sponsor } from "@/api/sponsors";
import { useTheme } from "@/contexts/useTheme";
import LogoLoop from "@/components/ui/LogoLoop";

const GRID_THRESHOLD = 4;

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const handleClick = () => {
    recordSponsorClick(sponsor.cnpj);
    const url = /^https?:\/\//i.test(sponsor.website)
      ? sponsor.website
      : `https://${sponsor.website}`;
    window.open(url, "_blank", "noopener noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      title={sponsor.name}
      aria-label={`Visitar site de ${sponsor.name}`}
      className="flex items-center justify-center cursor-pointer"
    >
      <img
        src={getSponsorImageUrl(sponsor.logo)}
        alt={sponsor.name}
        className="h-16 w-auto max-w-[160px] object-contain"
      />
    </button>
  );
}

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
              <SponsorLogo key={sp.cnpj} sponsor={sp} />
            ))}
          </div>
        ) : (
          <LogoLoop
            logos={sponsors.map((sp) => ({
              node: <SponsorLogo sponsor={sp} />,
              title: sp.name,
            }))}
            speed={80}
            direction="left"
            logoHeight={100}
            logoWidth={180}
            gap={72}
            hoverSpeed={0}
            fadeOut
            fadeOutColor={backgroundColorBack}
            isDarkMode={true}
            ariaLabel="Patrocinadores da SEMCOMP"
          />
        )}
      </div>
    </section>
  );
};

export default PatrocinadoresSection;
