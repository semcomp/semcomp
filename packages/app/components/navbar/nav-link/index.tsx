import Link from "next/link";

import styled, { css } from "styled-components";

/**
 * @param { Object } props
 * @param { string } props.href - The href attribute that will be passed down to the router link
 * @param { boolean } props.disabled - Whether the link is disabled or not. If the link is
 * disabled, a title should always be given
 * @param { string } props.title - The text that should be shown when the user hovers their
 * mouse over this element.
 * @param { string } props.className
 * @param { (event: MouseEvent) => void } props.onClick
 */
const NavLink = ({
  href,
  className,
  disabled,
  title,
  children,
  onClick,
  ...props
}: any) => {
  const NavLink = styled.div`
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

  /** @argument { MouseEvent } event */
  function handleClick(event) {
    // Disabled buttons or links shouldn't be clickable
    if (!disabled && onClick) {
      onClick(event);
    }
  }

  // This is the "content" that will go inside the link.
  const LinkText = (
    <>
      <a onClick={handleClick}>{children}</a>
    </>
  );

  return (
    <div>
      {disabled ? (
        <NavLink disabled title={title} {...props}>
          {LinkText}
        </NavLink>
      ) : (
        <Link href={href} title={title} onClick={handleClick} {...props}>
          <NavLink>{LinkText}</NavLink>
        </Link>
      )}
    </div>
  );
};

export default NavLink;
