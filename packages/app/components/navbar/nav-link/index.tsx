import Link from "next/link";
import { MouseEvent, MouseEventHandler, ReactNode } from "react";

type NavLinkProps = {
  href: string;
  className?: string;
  disabled?: boolean;
  title?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const NavLink = ({
  href,
  className,
  disabled,
  title,
  children,
  onClick,
  ...props
}: NavLinkProps) => {
  if (disabled && !title)
    throw new Error(
      `When the component NavLink receives a truthy value for it's 'disabled' prop, a 'title' should be given.`
    );

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!disabled && onClick) {
      onClick(event);
    }
  }

  const LinkText = (
    <>
      <section onClick={handleClick}>{children}</section>
    </>
  );

  return (
    <>
      {disabled ? (
        <a
          title={title}
          {...props}
          className="flex justify-center items-center px-2 py-2 mx-2 mb-2 text-lg rounded-lg cursor-not-allowed opacity-70 font-secondary"
        >
          {LinkText}
        </a>
      ) : (
        <Link href={href} title={title} {...props}>
          <button onClick={handleClick} style={{ outline: "none" }} className="nav">
            <a className="flex justify-center items-center px-2 py-2 mx-2 mb-2 text-lg rounded-lg hover:bg-hoverWhite duration-200 font-secondary">
              {LinkText}
            </a>
          </button>
        </Link>
      )}
    </>
  );
};

export default NavLink;
