import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import SectionWatermark from '@/components/ui/SectionWatermark';

const STATS = [
  { value: 2280,  prefix: '+', suffix: '',  label: 'estudantes de graduação\ne pós-graduação' },
  { value: 830,   prefix: '+', suffix: '',  label: 'alunos do ICMC com\npresença garantida' },
  { value: 10000, prefix: '+', suffix: '',  label: 'estudantes no campus\nUSP São Carlos' },
  { value: 29,    prefix: '',  suffix: 'ª', label: 'edições da maior semana\nde computação do Brasil' },
  { value: 16,    prefix: '',  suffix: '',  label: 'laboratórios exclusivos\nno ICMC' },
  { value: 450,   prefix: '',  suffix: '',  label: 'artigos científicos\npublicados por ano' },
];

export default function NumerosSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.numeros-heading', {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.numeros-heading', start: 'top 85%' },
      });

      gsap.utils.toArray<HTMLElement>('.stat-card').forEach((card, i) => {
        const numEl = card.querySelector<HTMLElement>('[data-target]');
        if (!numEl) return;
        const target = Number(numEl.dataset.target);
        const proxy = { val: 0 };

        gsap.from(card, {
          opacity: 0,
          y: 50,
          scale: 0.9,
          duration: 0.65,
          ease: 'power3.out',
          delay: (i % 3) * 0.09,
          scrollTrigger: { trigger: card, start: 'top 88%' },
        });

        gsap.to(proxy, {
          val: target,
          duration: 2.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 88%' },
          onUpdate() {
            numEl.textContent = Math.round(proxy.val).toLocaleString('pt-BR');
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-semcompLightBlue dark:bg-semcompAlmostDarkBlue relative overflow-hidden py-24 px-4"
    >
      <SectionWatermark
        src="/img/decorative/setas.png"
        className="w-[70vw] md:w-[50vw] right-0 top-1/2 -translate-y-1/2 translate-x-1/4 dark:hidden"
        style={{ mixBlendMode: 'multiply', opacity: 0.45 }}
      />
      <SectionWatermark
        src="/img/decorative/setas.png"
        className="w-[70vw] md:w-[50vw] right-0 top-1/2 -translate-y-1/2 translate-x-1/4 hidden dark:block"
        style={{ mixBlendMode: 'screen', opacity: 0.18 }}
      />

      <div className="relative z-10 section-container-wide">
        <div className="numeros-heading text-center mb-16">
          <p className="section-eyebrow">
            Por que investir na Semcomp?
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold font-poppins text-semcompDarkBlue dark:text-semcompOffWhite">
            A Semcomp em{' '}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-semcompMidDarkBlue to-semcompDarkBlue dark:from-semcompMidLightBlue dark:via-semcompLightBlue dark:to-semcompOffWhite">
              números
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {STATS.map(({ value, prefix, suffix, label }) => (
            <div
              key={label}
              className="stat-card rounded-2xl border border-semcompMidLightBlue/25 bg-white/50 backdrop-blur-sm p-6 md:p-8 text-center hover:border-semcompMidLightBlue/50 hover:bg-white/75 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-semcompLightBlue/30 dark:hover:bg-white/[0.07] transition-colors duration-300"
            >
              <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-poppins leading-none bg-clip-text text-transparent bg-linear-to-br from-semcompMidDarkBlue to-semcompDarkBlue dark:from-semcompLightBlue dark:to-semcompOffWhite mb-3">
                {prefix}
                <span data-target={value}>0</span>
                {suffix}
              </div>
              <p className="text-semcompDarkBlue/65 dark:text-semcompOffWhite/55 text-xs sm:text-sm font-poppins leading-snug whitespace-pre-line mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
