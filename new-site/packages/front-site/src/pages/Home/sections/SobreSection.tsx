import { motion } from "framer-motion";
import Carousel from "@/components/ui/Carousel";
import FotoSemcompMain from "@/assets/img/Home/Hero/Semcomp.avif";
import LogoSemcomp from "@/assets/img/semcomp/logo_default_preto.png";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/useTheme";


const _carouselModules = import.meta.glob(
  "/src/assets/img/Home/Carousel/*",
  { eager: true }
) as Record<string, { default: string }>;

const _carouselSrcs = Object.values(_carouselModules)
  .map((m) => m.default as string)
  .filter((s) => /\.(webp)$/i.test(s));

const altFromPath = (p: string) => {
  const base = p.split("/").pop() || p;
  const name = base.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
};

const CAROUSEL_IMAGES = _carouselSrcs.map((src) => ({ src, alt: altFromPath(src) }));

type SobreProps = {
  className?: string;
}
const SobreSection = (props: SobreProps) => {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();

  const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompMidDarkBlue";
  const gradientFrom = isDarkMode ? "from-semcompLightBlue/80" : "from-semcompMidDarkBlue";
  const gradientVia  = isDarkMode ? "via-semcompLightBlue" : "via-semcompMidLightBlue";
  const gradientTo = isDarkMode ? "to-semcompOffWhite" : "to-semcompMidLightBlue";
  const backgroundColor = isDarkMode ? "semcompAlmostDarkBlue" : "semcompLightBlue";
  const filtroCor = isDarkMode 
      ? "none" 
      : "invert(45%) sepia(35%) saturate(1100%) hue-rotate(164deg) brightness(93%) contrast(88%)"; // semcompMidLightBlue
  const sectionMargin = width > 768 ? "my-20" : "my-10";
  const headingSize = width > 768 ? "text-4xl" : "text-2xl";

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="sobre" className={`${props.className} w-full bg-${backgroundColor} overflow-hidden pb-40`}>
      <div className={`${sectionMargin}`}> </div>
      <div className="mx-auto max-w-[80%] relative">
        <img
          src={LogoSemcomp}
          alt="Logo Semcomp"
          className="absolute w-180 h-180 pointer-events-none opacity-10 z-0 left-2/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
          style={{ filter: filtroCor }}
        />
      <motion.h2
        className={`${headingSize} font-extrabold mb-6 `}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <span className={`${textColor} font-poppins-extrabold`}>SOBRE A</span>{" "}
        <span className={`bg-clip-text font-poppins-extrabold text-transparent bg-linear-to-r ${gradientFrom} ${gradientVia} ${gradientTo} font-extrabold`}>
          SEMCOMP
        </span>
        
      </motion.h2>
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-12 items-start p-0">
        <motion.div
          className="self-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <p className={`mb-4 ${textColor} font-poppins-regular text-justify`}>
            A Semcomp (Semana Acadêmica de Computação) é organizada por estudantes dos cursos de Ciência da Computação, Sistemas de Informação e Ciência de Dados do Instituto de Ciências Matemáticas e de Computação (ICMC) da USP São Carlos — cidade, inclusive, reconhecida como a Capital da Tecnologia.
          </p>
          <p className={`mb-4 ${textColor} font-poppins-regular text-justify`}>
            Realizado anualmente, o evento conta com uma programação diversificada e intensa, composta por palestras, minicursos, concursos, além do tradicional Hackathon e da já consagrada Game Night.
          </p>
          <p className={`mb-4 ${textColor} font-poppins-regular text-justify`}>
            Nosso propósito é ampliar as perspectivas de carreira dos estudantes, promovendo o contato direto com grandes nomes da indústria e da pesquisa no Brasil. Queremos que cada participante aproveite ao máximo a maior semana de computação do país.
          </p>
        </motion.div>
         
        <motion.div
          className="self-start relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="relative z-20">
            <Carousel
              images={
                CAROUSEL_IMAGES.length
                  ? CAROUSEL_IMAGES
                  : [
                      { src: FotoSemcompMain, alt: "Uma foto com toda a equipe da Semcomp 28" },
                    ]
              }
            />
          </div>
        </motion.div>
        
      </div>
      </div>
    </section>
    
  );
};

export default SobreSection;