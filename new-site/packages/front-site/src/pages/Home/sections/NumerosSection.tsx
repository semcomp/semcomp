import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import SectionWatermark from '@/components/ui/SectionWatermark';
import { getVisitorCount } from '@/api/stats';

const STATS = [
  { value: 2280,  prefix: '+', suffix: '',  label: 'estudantes de graduação\ne pós-graduação' },
  { value: 830,   prefix: '+', suffix: '',  label: 'alunos presentes de\ncursos de tecnologia' },
  { value: 10000, prefix: '+', suffix: '',  label: 'estudantes no campus\nUSP São Carlos' },
];

const CARD_CLASS =
  'rounded-2xl border border-semcompMidLightBlue/25 bg-white/50 backdrop-blur-sm p-6 md:p-8 text-center hover:border-semcompMidLightBlue/50 hover:bg-white/75 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-semcompLightBlue/30 dark:hover:bg-white/[0.07] transition-colors duration-300';

const NUM_CLASS =
  'text-sm sm:text-2xl md:text-3xl lg:text-5xl font-extrabold font-poppins leading-tight py-1 bg-clip-text text-transparent bg-linear-to-br from-semcompMidDarkBlue to-semcompDarkBlue dark:from-semcompLightBlue dark:to-semcompOffWhite mb-3';

const LABEL_CLASS =
  'text-semcompDarkBlue/65 dark:text-semcompOffWhite/55 text-xs sm:text-xs md:text-sm font-poppins leading-snug whitespace-pre-line mt-1';

export default function NumerosSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const visitorCardRef = useRef<HTMLDivElement>(null);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.stat-card').forEach((card) => {
        const numEl = card.querySelector<HTMLElement>('[data-target]');
        if (!numEl) return;
        const target = Number(numEl.dataset.target);
        const proxy = { val: 0 };

        gsap.to(proxy, {
          val: target,
          duration: 2.2,
          ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 90%', once: true },
          onUpdate() {
            numEl.textContent = Math.round(proxy.val).toLocaleString('pt-BR');
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    getVisitorCount().then(setVisitorCount);
  }, []);

  useEffect(() => {
    if (visitorCount === null || !visitorCardRef.current) return;
    const numEl = visitorCardRef.current.querySelector<HTMLElement>('[data-target]');
    if (!numEl) return;
    const proxy = { val: 0 };
    gsap.to(proxy, {
      val: visitorCount,
      duration: 2.2,
      ease: 'power2.out',
      scrollTrigger: { trigger: visitorCardRef.current, start: 'top 90%', once: true },
      onUpdate() {
        numEl.textContent = Math.round(proxy.val).toLocaleString('pt-BR');
      },
    });
  }, [visitorCount]);

  return (
    <section ref={sectionRef} className="bg-semcompOffWhite dark:bg-semcompMidDarkBlue relative overflow-hidden py-24 px-4">
      <SectionWatermark
        src="/img/decorative/setas.png"
        className="w-[70vw] md:w-[50vw] right-0 top-1/2 -translate-y-1/2 translate-x-1/4
          mix-blend-multiply opacity-55 dark:mix-blend-screen dark:opacity-15"
      />
      <div className="relative z-10 section-container-wide">
        <div className="text-center mb-16">
          <p className="section-eyebrow">Por que investir na SEMCOMP?</p>
          <h2 className="text-3xl md:text-5xl font-extrabold font-poppins text-semcompDarkBlue dark:text-semcompOffWhite">
            A SEMCOMP em{' '}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-semcompMidDarkBlue to-semcompDarkBlue dark:from-semcompMidLightBlue dark:via-semcompLightBlue dark:to-semcompOffWhite pb-1">
              números
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {STATS.map(({ value, prefix, suffix, label }) => (
            <div key={label} className={`stat-card ${CARD_CLASS}`}>
              <div className={NUM_CLASS}>
                {prefix}<span data-target={value}>0</span>{suffix}
              </div>
              <p className={LABEL_CLASS}>{label}</p>
            </div>
          ))}

          <div
            ref={visitorCardRef}
            className={`col-span-3 ${CARD_CLASS} transition-opacity duration-700 ${
              visitorCount !== null ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={NUM_CLASS}>
              <span data-target={visitorCount ?? 0}>0</span>
            </div>
            <p className={LABEL_CLASS}>{'acessos à\nnossa página oficial'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
