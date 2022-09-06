import FacebookLogo from "../../assets/facebook-logo.svg";
import InstagramLogo from "../../assets/instagram-logo.svg";
import LinkedinLogo from "../../assets/linkedin-logo.svg";
import GlobeIcon from "../../assets/globe-icon.svg";
import Image, { StaticImageData } from "next/image";
import LogoLink from "./logo-link";

type sponsorProps = {
  companyName: string;
  companyDescription?: string;
  companyLinks: any;
  companyLogo: StaticImageData;
};

function SponsorCard({
  companyName,
  companyDescription,
  companyLinks,
  companyLogo,
}: sponsorProps) {
  return (
    <div className="rounded-lg border-solid border border-white overflow-auto h-full w-full flex flex-col p-4 bg-white my-2.5 mx-5">
      {companyLinks && (
        <div className="flex flex-col justify-between h-full p-0">
          <Image src={companyLogo} layout="intrinsic" />
          <p className="my-2">{companyDescription}</p>
          <div className="flex justify-center">
            {companyLinks.homepage && (
              <LogoLink icon={GlobeIcon} link={companyLinks.homepage} />
            )}
            {companyLinks.facebook && (
              <LogoLink icon={FacebookLogo} link={companyLinks.facebook} />
            )}
            {companyLinks.linkedin && (
              <LogoLink icon={LinkedinLogo} link={companyLinks.linkedin} />
            )}
            {companyLinks.instagram && (
              <LogoLink icon={InstagramLogo} link={companyLinks.instagram} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SponsorCard;