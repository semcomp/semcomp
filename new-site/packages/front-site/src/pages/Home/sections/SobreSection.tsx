import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import Carousel from "@/components/ui/Carousel";
import RevealHeading from "@/components/ui/RevealHeading";
import SectionWatermark from "@/components/ui/SectionWatermark";

const altFromPath = (name: string) => {
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const CAROUSEL_IMAGES = [
  "Context", "Feira", "Hackathon", "Integracao", "palestra", "Pergunta", "Semcomp28",
].map((name) => ({ src: `/img/Home/Carousel/${name}.webp`, alt: altFromPath(name) }));

type SobreProps = {
  className?: string;
};

const SobreSection = ({ className }: SobreProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.sobre-para', {
        opacity: 0,
        y: 30,
        duration: 0.62,
        stagger: 0.16,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.sobre-text', start: 'top 82%' },
      });

      gsap.from('.sobre-carousel', {
        opacity: 0,
        x: 64,
        duration: 0.88,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.sobre-carousel', start: 'top 80%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="sobre"
      className={`${className} w-full bg-semcompLightBlue dark:bg-semcompAlmostDarkBlue overflow-hidden pb-16 md:pb-40`}
    >
      <div className="my-10 md:my-20" />
      <div className="section-container relative">
        <SectionWatermark
          src="/img/semcomp/logo_default_preto.png"
          className="w-[70vw] md:w-180 opacity-10 left-2/2 top-1/3 -translate-x-1/2 -translate-y-1/2 sobre-watermark-light"
          float
        />

        <RevealHeading
          words={[{ text: 'SOBRE A' }, { text: 'SEMCOMP', gradient: true }]}
          plainClass="text-semcompMidDarkBlue dark:text-semcompOffWhite"
          gradientClass="bg-linear-to-r from-semcompMidDarkBlue via-semcompMidLightBlue to-semcompMidLightBlue dark:from-semcompLightBlue/80 dark:via-semcompLightBlue dark:to-semcompOffWhite"
          className="text-2xl md:text-4xl font-extrabold mb-6 font-poppins"
        />

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-12 items-start p-0">
          <div className="sobre-text self-start">
            <p className="sobre-para mb-4 text-semcompMidDarkBlue dark:text-semcompOffWhite font-poppins text-justify">
              A Semcomp (Semana Acadêmica de Computação) é organizada por estudantes dos cursos de Ciência da Computação, Sistemas de Informação e Ciência de Dados do Instituto de Ciências Matemáticas e de Computação (ICMC) da USP São Carlos — cidade, inclusive, reconhecida como a Capital da Tecnologia.
            </p>
            <p className="sobre-para mb-4 text-semcompMidDarkBlue dark:text-semcompOffWhite font-poppins text-justify">
              Realizado anualmente, o evento conta com uma programação diversificada e intensa, composta por palestras, minicursos, concursos, além do tradicional Hackathon e da já consagrada Game Night.
            </p>
            <p className="sobre-para mb-4 text-semcompMidDarkBlue dark:text-semcompOffWhite font-poppins text-justify">
              Nosso propósito é ampliar as perspectivas de carreira dos estudantes, promovendo o contato direto com grandes nomes da indústria e da pesquisa no Brasil. Queremos que cada participante aproveite ao máximo a maior semana de computação do país.
            </p>
          </div>

          <div className="sobre-carousel self-start relative">
            <div className="relative z-20">
              <Carousel images={CAROUSEL_IMAGES} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SobreSection;
