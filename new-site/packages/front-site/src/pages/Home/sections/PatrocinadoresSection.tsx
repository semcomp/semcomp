import { useState, useEffect, useRef } from "react";
import type { SponsorType } from "@/types/SponsorType";
import { sponsorsAPI, getSponsorImageUrl } from "@/api/sponsors";
import type { Sponsor } from "@/api/sponsors";
import { useTheme } from "@/contexts/useTheme";
import LogoLoop from "@/components/ui/LogoLoop";

const EXTENSION_GROUP_IMAGES = [
  "/img/extension-groups/codelab.svg",
  "/img/extension-groups/data.png",
  "/img/extension-groups/fog.png",
  "/img/extension-groups/ganesh.png",
  "/img/extension-groups/gema.png",
  "/img/extension-groups/pet.png",
];

type PatrocinadoresProps = {
  sponsors: SponsorType[];
  className?: string;
};

const PatrocinadoresSection = ({}: PatrocinadoresProps) => {
  const [sponsors, setSponsors] = useState<Sponsor[]>(
    EXTENSION_GROUP_IMAGES.map((src, i) => ({
      ID: i,
      name: `Grupo de Extensão ${i + 1}`,
      logo: src,
    }))
  );
  const { isDarkMode } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    sponsorsAPI
      .getAll()
      .then((data) => { if (data.length > 0) setSponsors(data); })
      .catch(() => {});
  }, []);

  if (sponsors.length === 0) return null;

  const backgroundColorBack = isDarkMode ? "#0F486D" : "#2c6e94";

  const logoItems = sponsors.map((sponsor) => ({
    src: getSponsorImageUrl(sponsor.logo),
    alt: sponsor.name,
    title: sponsor.name,
  }));

  return (
    <section
      ref={sectionRef}
      className="w-full overflow-hidden"
      style={{ backgroundColor: backgroundColorBack }}
    >
      <div className="w-full py-4 px-4 sm:px-8 lg:px-16 bg-semcompMidLightBlue dark:bg-semcompMidDarkBlue">
        <h2 className="font-poppins text-center text-xl sm:text-2xl text-semcompLightBlue dark:text-semcompOffWhite">
          Nossos Patrocinadores
        </h2>
      </div>

      <div className="py-10">
        <LogoLoop
          logos={logoItems}
          speed={80}
          direction="left"
          logoHeight={100}
          logoWidth={180}
          gap={72}
          hoverSpeed={0}
          fadeOut
          fadeOutColor={backgroundColorBack}
          isDarkMode={true}
          ariaLabel="Patrocinadores da Semcomp"
        />
      </div>
    </section>
  );
};

export default PatrocinadoresSection;
