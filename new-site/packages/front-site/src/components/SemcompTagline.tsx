import { motion } from "framer-motion";

export default function SemcompTagline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="w-full bg-semcompDarkBlue backdrop-blur-sm py-4 text-center"
    >
      <h2 className="text-xl md:text-2xl font-popins text-semcompOffWhite">
        A maior Semana da Computação do Brasil
      </h2>
    </motion.div>
  );
}
