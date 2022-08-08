import "./style.css";

/**
 * @param { Object } props
 * @param { string } props.link
 * @param { string } props.icon The URL of the icon's image
 */
function LogoLink({ link, icon }) {
  return (
    <a href={link} rel="noopener" className="logo-link-component">
      <img alt="" src={icon} />
    </a>
  );
}

export default LogoLink;
