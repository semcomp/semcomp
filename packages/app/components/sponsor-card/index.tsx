import FacebookLogo from "../../assets/facebook-logo.svg";
import InstagramLogo from "../../assets/instagram-logo.svg";
import LinkedinLogo from "../../assets/linkedin-logo.svg";
import GlobeIcon from "../../assets/globe-icon.svg";
import CareersLogo from "../../assets/lupa.png";
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
    <div className="overflow-auto flex flex-col items-center">
      {companyLinks && (
        <div className="flex flex-col justify-between h-full p-0">
          <div className="relative h-32 w-48">
            <Image
              alt={"Logo " + companyName}
              src={companyLogo}
              layout="fill"
              objectFit="contain"
            />
          </div>
          {/* <p className="my-2">{companyName}</p>
          <p className="my-2">{companyDescription}</p> */}
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
            {companyLinks.careers && (
              <LogoLink icon={CareersLogo} link={companyLinks.careers} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SponsorCard;
