import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQList({ faqs }: { faqs: Array<{ Q: string; A: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4 max-w-[90%] md:max-w-[80%] lg:max-w-[70%] mx-auto">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="faq-item bg-semcompOffWhite rounded-xl shadow-md overflow-hidden sm:hover:scale-105 transition-transform duration-300"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-6 text-sm md:text-lg text-left cursor-pointer"
          >
            <span className="text-semcompDarkBlue">{faq.Q}</span>
            <ChevronDown
              className={`text-semcompMidDarkBlue flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
              size={20}
            />
          </button>

          {/* Accordion — CSS grid-template-rows (sem JS de altura) */}
          <div
            className="grid transition-[grid-template-rows] duration-300 ease-out"
            style={{ gridTemplateRows: openIndex === i ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <p className="px-6 pb-6 text-justify text-xs md:text-sm text-semcompMidDarkBlue">
                {faq.A}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
