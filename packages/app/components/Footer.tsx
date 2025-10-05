import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import { config } from "../config";

function SocialLinkIcon({ link, icon }: { link: string; icon: any }) {
  return (
    <div className="p-1">
      <a
        className="p-2 bg-white rounded-full text-primary"
        href={link}
        rel="noopener"
      >
        {icon}
      </a>
    </div>
  ); 
}

/*
Don't forget to add a `rel="noopnener"` to any link that goes outside the
Semcomp site. If you want to know why, see this link:
https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
(ps: I know this is only meaningful on target="_blank" links, but I'd
rather place this everywhere in case someone adds a target="_blank" later.
*/
const Footer = (props) => {

  let footerStyle = "items-center justify-around p-4 lg:flex font-secondary text-sm ";
  props.className ? (footerStyle += props.className) : footerStyle += "shadow-2xl bg-white text-primary";

  return (
      <footer className={footerStyle}>
        <section className="py-2 text-center mobile:hidden">
          <p>Entre em contato conosco</p>
        <div className="flex flex-col items-center">
          <div className="flex items-center my-1">
            <EmailIcon sx={{ mr: 0.5 }} />
            <a href={`mailto:${config.ORGANIZING_COMMITTEE_EMAIL}`}>{config.ORGANIZING_COMMITTEE_EMAIL}</a>
          </div>
          <div className="flex items-center my-1">
            <EmailIcon sx={{ mr: 0.5 }} />
            <a href={`mailto:${config.ORGANIZING_COMMITTEE_PATROCINIO_EMAIL}`}>
              {config.ORGANIZING_COMMITTEE_PATROCINIO_EMAIL}
            </a>
          </div>
        </div>
      </section>
      <section className="py-2 text-sm text-center">
        <p>© Semcomp {config.YEAR}. Todos os direitos reservados.</p>
      </section>
      <section className="py-2 text-sm text-center">
        <p>Nos siga nas redes sociais</p>
        <div className="flex justify-center p-2">
          <SocialLinkIcon
            link={config.ORGANIZING_COMMITTEE_FACEBOOK_LINK}
            icon={<FacebookIcon />}
          />
          <SocialLinkIcon
            link={config.ORGANIZING_COMMITTEE_YOUTUBE_LINK}
            icon={<YouTubeIcon />}
          />
          <SocialLinkIcon
            link={config.ORGANIZING_COMMITTEE_INSTAGRAM_LINK}
            icon={<InstagramIcon />}
          />
          <SocialLinkIcon
            link={config.ORGANIZING_COMMITTEE_LINKEDIN_LINK}
            icon={<LinkedInIcon />}
          />
          <SocialLinkIcon
            link={config.ORGANIZING_COMMITTEE_TWITTER_LINK}
            icon={<TwitterIcon />}
          />
        </div>
      </section>
    </footer>
  );
};

export default Footer;
