import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQList({ faqs }: { faqs: Array<{ Q: string; A: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (


      <div className="space-y-4 max-w-[90%] md:max-w-[80%] lg:max-w-[70%] mx-auto">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="bg-semcompOffWhite rounded-xl shadow-md overflow-hidden hover:scale-110 transition-transform duration-300 cursor-pointer"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-6 text-sm md:text-lg text-left"
            >
              <span className="text-justify text-semcompDarkBlue">{faq.Q}</span>
              <motion.span
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="text-semcompMidDarkBlue" size={20} />
              </motion.span>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="px-6 pb-6 text-justify text-xs md:text-sm text-semcompMidDarkBlue">{faq.A}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
  );
}
