import React from "react";

import Face from "../../assets/face_logo.png";
import Ln from "../../assets/linkedin_logo.png";
import Insta from "../../assets/instagram_logo.png";
import Twt from "../../assets/twitter-logo.png";
import Ytube from "../../assets/youtube-logo.png";

import "./style.css";

const Footer = () => {
  return (
    <div className="footer-container">
      <div className="shiny-divider"></div>
      <footer className="footer-component">
        <p>Nos siga nas redes sociais</p>
        <div>
          {/* Don't forget to add a `rel="noopnener"` to any link that goes outside the
				Semcomp site. If you want to know why, see this link:
				https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
				(ps: I know this is only meaningful on target="_blank" links, but I'd
				rather place this everywhere in case someone adds a target="_blank" later. */}
          <a href="https://www.facebook.com/Semcomp/" rel="noopener">
            <img alt="Facebook" src={Face} />
          </a>
          <a
            href="https://www.youtube.com/channel/UCPF97UIRX8AnkS9gU907g1Q"
            rel="noopener"
          >
            <img alt="Youtube" src={Ytube} />
          </a>
          <a href="https://instagram.com/semcomp" rel="noopener">
            <img alt="Instagram" src={Insta} />
          </a>
          <a href="https://www.linkedin.com/company/semcomp/" rel="noopener">
            <img alt="Linkedin" src={Ln} />
          </a>
          <a href="https://twitter.com/semcomp" rel="noopener">
            <img alt="Twitter" src={Twt} />
          </a>
        </div>
        <p className="copyright">
          © Semcomp 2021. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Footer;
