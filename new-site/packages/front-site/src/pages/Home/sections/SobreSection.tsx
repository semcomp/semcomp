import Carousel from "@/components/ui/Carousel";
import SectionWatermark from "@/components/ui/SectionWatermark";

const altFromPath = (name: string) =>
  name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const CAROUSEL_IMAGES = [
  "Context", "Feira", "Hackathon", "Integracao", "palestra", "Pergunta", "SEMCOMP28",
].map((name) => ({ src: `/img/Home/Carousel/${name}.webp`, alt: altFromPath(name) }));

type SobreProps = { className?: string };

const SobreSection = ({ className }: SobreProps) => (
  <section
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

      <h2 className="text-2xl md:text-4xl font-extrabold mb-6 font-poppins">
        <span className="text-semcompMidDarkBlue dark:text-semcompOffWhite">SOBRE A </span>
        <span className="bg-clip-text text-transparent bg-linear-to-r from-semcompMidDarkBlue via-semcompMidLightBlue to-semcompMidLightBlue dark:from-semcompLightBlue/80 dark:via-semcompLightBlue dark:to-semcompOffWhite">
          SEMCOMP
        </span>
      </h2>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-12 items-start p-0">
        <div className="self-start">
          <p className="mb-4 text-semcompMidDarkBlue dark:text-semcompOffWhite font-poppins text-justify">
            A SEMCOMP (Semana Acadêmica de Computação) é organizada por estudantes dos cursos de Ciência da
            Computação, Sistemas de Informação e Ciência de Dados do Instituto de Ciências Matemáticas e de
            Computação (ICMC) da USP São Carlos — cidade, inclusive, reconhecida como a Capital da Tecnologia.
          </p>
          <p className="mb-4 text-semcompMidDarkBlue dark:text-semcompOffWhite font-poppins text-justify">
            Realizado anualmente, o evento conta com uma programação diversificada e intensa, composta por
            palestras, minicursos, concursos, além do tradicional Hackathon e da já consagrada Game Night.
          </p>
          <p className="mb-4 text-semcompMidDarkBlue dark:text-semcompOffWhite font-poppins text-justify">
            Nosso propósito é ampliar as perspectivas de carreira dos estudantes, promovendo o contato direto
            com grandes nomes da indústria e da pesquisa no Brasil. Queremos que cada participante aproveite ao
            máximo a maior semana de computação do país.
          </p>
        </div>

        <div className="self-start relative">
          <div className="relative z-20">
            <Carousel images={CAROUSEL_IMAGES} />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default SobreSection;
