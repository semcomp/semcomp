import LogoLink from "./logo-link";

import FacebookLogo from "../../../assets/facebook-logo.svg";
import InstagramLogo from "../../../assets/instagram-logo.svg";
import LinkedinLogo from "../../../assets/linkedin-logo.svg";
import GlobeIcon from "../../../assets/globe-icon.svg";

/**
 * @param { Object } props
 * @param { string } props.companyDescription
 * @param { string } props.companyLogo The URL of the company's logo image
 * @param { Object } props.companyLinks
 * @param { string } props.companyLinks.facebook
 * @param { string } props.companyLinks.linkedin
 * @param { string } props.companyLinks.instagram
 * @param { string } props.companyLinks.homepage
 */
function SponsorCard({ companyDescription, companyLinks, companyLogo }) {
  return (
    <div className="sponsor-card">
      <div
        className="company-logo"
        style={{ backgroundImage: `url('${companyLogo}')` }}
      />
      {companyLinks && (
        <div className="card-body">
          <p className="company-description">{companyDescription}</p>
          <div className="sponsor-social">
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
