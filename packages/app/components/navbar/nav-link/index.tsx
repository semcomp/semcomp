import Link from "next/link";
import { MouseEvent, MouseEventHandler, ReactNode } from "react";

import styled, { css } from "styled-components";

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
  const NavLink = styled.a`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.25rem 0.5rem;
    margin: 0 0.5rem;
    height: 3vh;
    font-size: 18px;
    color: white;
    border-radius: 8px;
    transition: 200ms;
    cursor: pointer;

    :link,
    :active,
    :focus {
      text-decoration: none;
      outline: none;
    }

    :hover {
      background-color: rgba(255, 255, 255, 0.3);
      color: white;
    }

    ${(props) =>
      props.disabled &&
      css`
        /* opacity: 0.7; */
        cursor: not-allowed;

        :hover {
          background-color: none;
        }
      `}
  `;

  if (disabled && !title)
    throw new Error(
      `When the component NavLink receives a truthy value for it's 'disabled' prop, a 'title' should be given.`
    );

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!disabled && onClick) {
      onClick(event);
    }
  }

  // This is the "content" that will go inside the link.
  const LinkText = (
    <>
      <section onClick={handleClick}>{children}</section>
    </>
  );

  return (
    <>
      {disabled ? (
        <NavLink disabled title={title} {...props}>
          {LinkText}
        </NavLink>
      ) : (
        <Link href={href} title={title} onClick={handleClick} {...props}>
          <NavLink>{LinkText}</NavLink>
        </Link>
      )}
    </>
  );
};

export default NavLink;
