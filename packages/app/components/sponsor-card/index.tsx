import FacebookLogo from "../../assets/facebook-logo.svg";
import InstagramLogo from "../../assets/instagram-logo.svg";
import LinkedinLogo from "../../assets/linkedin-logo.svg";
import Image, { StaticImageData } from "next/image";
import LogoLink from "./logo-link";
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import NavLink from "../navbar/nav-link";
import Tooltip from '@mui/material/Tooltip';

type sponsorProps = {
  companyName: string;
  companyDescription?: string;
  companyType: string;
  companyLinks: any;
  companyLogo: StaticImageData;
};

function SponsorCard({
  companyName,
  companyDescription,
  companyType,
  companyLinks,
  companyLogo,
}: sponsorProps) {
  return (
    <div className={"overflow-auto flex flex-col items-center "}>
      {companyLinks && (
        <div className="flex flex-col justify-between h-full p-0 m-0">
          <div className={"relative h-32 w-48  " + (companyType == 'Supporter' ? "lg:w-[140px] " : "lg:w-40 ")}>
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
              <NavLink href={companyLinks.homepage}>
                <Tooltip title="Site">
                  <PublicRoundedIcon sx={{ color: "#002776" }} />
                </Tooltip>
              </NavLink>
            )}
            {/* {companyLinks.facebook && (
              <LogoLink icon={FacebookLogo} link={companyLinks.facebook} />
            )}
            {companyLinks.linkedin && (
              <LogoLink icon={LinkedinLogo} link={companyLinks.linkedin} />
            )}
            {companyLinks.instagram && (
              <LogoLink icon={InstagramLogo} link={companyLinks.instagram} />
            )} */}
            {companyLinks.careers && (
              <NavLink href={companyLinks.careers}>
                <Tooltip title="Carreiras">
                  <WorkRoundedIcon sx={{ color: "#002776" }} />
                </Tooltip>
              </NavLink>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SponsorCard;
