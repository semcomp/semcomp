import { FaYoutube } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { FC } from "react";

export const NewFooter: FC = () => {
  return (
    <footer className="phone:relative absolute bottom-0 left-0 w-full px-6 pb-4 z-50 bg-background-secondary font-secondary">
      <div className="flex flex-col items-center justify-between sm:flex-row">
        <span className="hidden text-lg font-bold text-white sm:inline">
          © 2024 <a href={``} className="hover:underline">SEMCOMP</a>
        </span>
        <div className="flex items-center gap-6 mt-4 sm:mt-0 sm:justify-end"> 
          <a href="https://www.youtube.com/channel/UCPF97UIRX8AnkS9gU907g1Q" className="flex items-center text-white hover:text-primary">
            <FaYoutube className="w-6 h-6" />
            <span className="sr-only">YouTube</span>
          </a>
          <a href="https://www.instagram.com/semcomp/" className="flex items-center text-white hover:text-primary">
            <AiFillInstagram className="w-6 h-6" />
            <span className="sr-only">Instagram</span>
          </a>
          <a href="https://www.linkedin.com/company/semcomp/mycompany/" className="flex items-center text-white hover:text-primary">
            <FaLinkedinIn className="w-6 h-6" />
            <span className="sr-only">LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
