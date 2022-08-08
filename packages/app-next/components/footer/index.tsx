import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";

import Face from "../../assets/round-facebook-white.png";
import Ln from "../../assets/round-linkedin-white.png";
import Insta from "../../assets/round-instagram-white.png";
import Twt from "../../assets/round-twitter-white.png";
import Ytube from "../../assets/round-youtube-white.png";

/* 
Don't forget to add a `rel="noopnener"` to any link that goes outside the
Semcomp site. If you want to know why, see this link:
https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
(ps: I know this is only meaningful on target="_blank" links, but I'd
rather place this everywhere in case someone adds a target="_blank" later. 
*/
const Footer = () => {
  return (
    <div className="footer-container">
      <div className="shiny-divider"></div>
      <footer className="footer-component">
        <section className="footer-section">
          <p>Entre em contato conosco</p>
          <div className="email-field">
            <EmailIcon sx={{ mr: 0.5 }} />
            <a href="mailto:semcomp@icmc.usp.br">
              Assuntos gerais: semcomp@icmc.usp.br
            </a>
          </div>
          <div className="email-field">
            <EmailIcon sx={{ mr: 0.5 }} />
            <a href="mailto:patrocinio_semcomp@icmc.usp.br">
              Patrocínio: patrocinio_semcomp@icmc.usp.br
            </a>
          </div>
        </section>
        <section className="footer-section">
          <p className="copyright">
            © Semcomp 2022. Todos os direitos reservados.
          </p>
        </section>
        <section className="footer-section">
          <p>Nos siga nas redes sociais</p>
          <div className="social-icons">
            <a href="https://www.facebook.com/Semcomp/" rel="noopener">
              <img alt="Facebook" src={Face.src} />
            </a>
            <a
              href="https://www.youtube.com/channel/UCPF97UIRX8AnkS9gU907g1Q"
              rel="noopener"
            >
              <img alt="Youtube" src={Ytube.src} />
            </a>
            <a href="https://instagram.com/semcomp" rel="noopener">
              <img alt="Instagram" src={Insta.src} />
            </a>
            <a href="https://www.linkedin.com/company/semcomp/" rel="noopener">
              <img alt="Linkedin" src={Ln.src} />
            </a>
            <a href="https://twitter.com/semcomp" rel="noopener">
              <img alt="Twitter" src={Twt.src} />
            </a>
          </div>
        </section>
      </footer>
    </div>
  );
};

export default Footer;
