import Image from "next/image";
import NavLink from "../../navbar/nav-link";

type logoLinkProps = {
  link: string;
  icon: string;
};

function LogoLink({ link, icon }: logoLinkProps) {
  return (
    <NavLink href={link}>
      <Image alt={icon} src={icon} width={50} height={50} />
    </NavLink>
  );
}

export default LogoLink;
