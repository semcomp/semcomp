import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import FAQList from "@/components/FAQList";
import FAQS from "@/lib/constants/FAQS";
import RevealHeading from "@/components/ui/RevealHeading";
import SectionWatermark from "@/components/ui/SectionWatermark";

type FAQSectionProps = { className?: string };

const FAQSection = ({ className }: FAQSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.faq-item', {
        opacity: 0,
        y: 16,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: { trigger: '.faq-list', start: 'top 85%', once: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="faq" className={`${className} w-full py-10 md:py-30 relative overflow-hidden`}>
      <SectionWatermark
        src="/img/decorative/lines_circled.png"
        className="w-full md:w-[80vw] opacity-[0.07] right-0 top-0 -translate-y-1/4"
        style={{ mixBlendMode: 'multiply' }}
      />
      <SectionWatermark
        src="/img/decorative/lines.png"
        className="w-full md:w-[70vw] opacity-[0.06] left-0 bottom-0 translate-y-1/4"
        style={{ mixBlendMode: 'multiply' }}
      />
      <div className="section-container relative z-10">
        <RevealHeading
          words={[{ text: 'PERGUNTAS' }, { text: 'FREQUENTES', gradient: true }]}
          plainClass="text-semcompDarkBlue dark:text-semcompOffWhite"
          gradientClass="bg-linear-to-r from-semcompDarkBlue/80 via-semcompDarkBlue to-semcompOffBlack dark:from-semcompLightBlue/80 dark:via-semcompLightBlue dark:to-semcompOffWhite"
          className="text-2xl md:text-4xl font-extrabold mb-10 text-center font-poppins"
        />
        <FAQList className="faq-list w-[90%] md:w-[80%] lg:w-[70%] mx-auto" faqs={FAQS} />
      </div>
    </section>
  );
};

export default FAQSection;
