import { FaYoutube } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { FC } from "react";

import { config } from "../config";

export const NewFooter: FC = () => {
  return (
    <footer className="phone:relative absolute bottom-0 left-0 w-full px-6 pb-4 z-50 bg-background-secondary font-secondary">
      <div className="flex flex-col items-center justify-between sm:flex-row">
        <span className="hidden text-lg font-bold text-white sm:inline">
          © {config.YEAR} <a href={``} className="hover:underline">SEMCOMP</a>
        </span>
        <div className="flex items-center gap-6 mt-4 sm:mt-0 sm:justify-end"> 
          <a href={config.ORGANIZING_COMMITTEE_YOUTUBE_LINK} className="flex items-center text-white hover:text-primary">
            <FaYoutube className="w-6 h-6" />
            <span className="sr-only">YouTube</span>
          </a>
          <a href={config.ORGANIZING_COMMITTEE_INSTAGRAM_LINK} className="flex items-center text-white hover:text-primary">
            <AiFillInstagram className="w-6 h-6" />
            <span className="sr-only">Instagram</span>
          </a>

          <a href={config.ORGANIZING_COMMITTEE_TWITTER_LINK} className="flex items-center text-white hover:text-primary">
            <FaXTwitter className="w-6 h-6" />
            <span className="sr-only">X</span>
          </a>
          <a href={config.ORGANIZING_COMMITTEE_LINKEDIN_LINK} className="flex items-center text-white hover:text-primary">
            <FaLinkedinIn className="w-6 h-6" />
            <span className="sr-only">LinkedIn</span>
          </a>
          <a href={`mailto:${config.ORGANIZING_COMMITTEE_EMAIL}`} className="flex items-center text-white hover:text-primary">
            <MdOutlineAlternateEmail className="w-6 h-6" />
            <span className="sr-only">Email</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
