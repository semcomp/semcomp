import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  faqs: Array<{ Q: string; A: string }>;
  className?: string;
};

export default function FAQList({ faqs, className }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="faq-item bg-semcompOffWhite rounded-xl shadow-md overflow-hidden [@media(hover:hover)]:hover:scale-[1.02] transition-transform duration-300"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 p-6 text-sm md:text-base text-left cursor-pointer"
          >
            <span className="text-semcompDarkBlue font-medium">{faq.Q}</span>
            <ChevronDown
              className={`text-semcompMidDarkBlue flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
              size={20}
            />
          </button>

          <div
            className="grid transition-[grid-template-rows] duration-300 ease-out"
            style={{ gridTemplateRows: openIndex === i ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <p className="px-6 pb-6 text-xs md:text-sm text-semcompMidDarkBlue text-justify">
                {faq.A}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
