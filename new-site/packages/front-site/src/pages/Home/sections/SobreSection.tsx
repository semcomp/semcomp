import { motion } from "framer-motion";
import Carousel from "@/components/ui/Carousel";
import FotoSemcompMain from "@/assets/img/Home/Hero/Semcomp.avif";
import { useSectionStyles } from "@/hooks/useSectionStyles";
import { ANIMATIONS, ANIMATION_VIEWPORT } from "@/lib/animations";


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
  const { textColor, gradientClass } = useSectionStyles();

  return (
    <section id="sobre" className={`${props.className} w-full my-10 md:my-20`}>
      <div className="mx-auto max-w-[80%]">
        <motion.h2
          className={`text-2xl md:text-4xl font-extrabold mb-6`}
          initial="hidden"
          whileInView="visible"
          viewport={ANIMATION_VIEWPORT}
          variants={ANIMATIONS.fadeIn}
        >
          <span className={`${textColor} font-poppins-extrabold`}>SOBRE A</span>{" "}
          <span className={`bg-clip-text font-poppins-extrabold text-transparent ${gradientClass}`}>
            SEMCOMP
          </span>
        </motion.h2>
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-12 items-start p-0">
          <motion.div
            className="self-start"
            initial="hidden"
            whileInView="visible"
            viewport={ANIMATION_VIEWPORT}
            variants={ANIMATIONS.fadeIn}
          >
            <Carousel
              images={
                CAROUSEL_IMAGES.length
                  ? CAROUSEL_IMAGES
                  : [
                      { src: FotoSemcompMain, alt: "Uma foto com toda a equipe da Semcomp 28" },
                    ]
              }
            />
          </motion.div>

          <motion.div
            className="self-start"
            initial="hidden"
            whileInView="visible"
            viewport={ANIMATION_VIEWPORT}
            variants={ANIMATIONS.fadeIn}
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
        </div>
      </div>
    </section>
  );
};

export default SobreSection;