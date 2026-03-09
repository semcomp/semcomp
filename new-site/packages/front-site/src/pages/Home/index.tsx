import TEAM from "../../libs/constants/Team";
import FAQS from "../../libs/constants/FAQS";
import TeamGrid from "../../components/TeamGrid";
import FAQList from "../../components/FAQList";
import MainEntrance from "../../components/MainEntrance";
import Carousel from "../../components/ui/Carousel";
import FotoSemcompMain from "../../assets/img/semcomp/Semcomp28.jpg";
import FotoSemcompMain2 from "../../assets/img/semcomp/logo_default_branco.png";

export default function HomePage() {

  return (
    <div className="w-full font-sans-custom">
      <MainEntrance />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <h2 className="text-3xl font-bold text-[#115079] mb-6 text-4xl font-bold mb-6">Sobre a Semcomp</h2>
        <section id="sobre" className="py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="self-start">
            {/*Trocar as imagens dps*/}
            <Carousel
              images={[
                { src: FotoSemcompMain, alt: "Description" },
                { src: FotoSemcompMain2, alt: "Description" },
              ]}/>
          </div>
          <div className="self-start">
            <p className="mb-4">
              A Semcomp (Semana Acadêmica de Computação) é organizada por estudantes dos cursos de Ciência da Computação, Sistemas de Informação e Ciência de Dados do Instituto de Ciências Matemáticas e de Computação (ICMC) da USP São Carlos — cidade, inclusive, reconhecida como a Capital da Tecnologia.
            </p>
            <p className="mb-4">
              Realizado anualmente, o evento conta com uma programação diversificada e intensa, composta por palestras, minicursos, concursos, além do tradicional Hackathon e da já consagrada Game Night.
            </p>
            <p className="mb-4">
              Nosso propósito é ampliar as perspectivas de carreira dos estudantes, promovendo o contato direto com grandes nomes da indústria e da pesquisa no Brasil. Queremos que cada participante aproveite ao máximo a maior semana de computação do país.
            </p>
          </div>
          
        </section>

        <section id="patrocinadores" className="bg-gray-100 py-20 text-center">
          <h2 className="text-3xl font-bold text-[#115079] mb-10 font-display">Patrocinadores</h2>
          <div className="flex justify-center gap-10 flex-wrap">
            <div className="w-40 h-20 bg-semcompWhite shadow flex items-center justify-center">Logo</div>
            <div className="w-40 h-20 bg-semcompWhite shadow flex items-center justify-center">Logo</div>
            <div className="w-40 h-20 bg-semcompWhite shadow flex items-center justify-center">Logo</div>
          </div>
        </section>

        <section id="equipe" className="py-20 text-center">
          <h2 className="text-3xl font-bold text-[#115079] mb-10 font-display">Equipe</h2>
          {/* Equipe por departamento */}

          <TeamGrid data={TEAM} />
        </section>

          <section id="faq" className="py-20 max-w-4xl mx-auto px-10">
            <h2 className="text-3xl font-bold text-[#115079] mb-10">FAQ</h2>
            <FAQList faqs={FAQS} />
        </section>

        <section id="contato" className="py-20 text-center">
          <h2 className="text-3xl font-bold text-[#115079] mb-6">Entre em contato</h2>
          <p>patrocinio_semcomp@icmc.usp.br</p>
          <p>semcomp@icmc.usp.br</p>
        </section>
      </main>
    </div>
  );
}
