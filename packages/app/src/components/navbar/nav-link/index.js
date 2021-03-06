import React from "react";
import { HashLink as Link } from "react-router-hash-link";

import "./style.css";

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
}) => {
  // This behavior is related to accessibility concerns. Giving a proper title
  // will help your users to be aware of the reasons this component might be disabled,
  // creating a more understandable interface.
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
      <div onClick={handleClick}>{children}</div>
    </>
  );

  return (
    <div className="link-button">
      {disabled ? (
        <div
          title={title}
          className={`navlink disabled ${className || ""}`}
          {...props}
        >
          {LinkText}
        </div>
      ) : (
        <Link
          to={href}
          className={`navlink ${className || ""}`}
          title={title}
          onClick={handleClick}
          {...props}
        >
          {LinkText}
        </Link>
      )}
    </div>
  );
};

export default NavLink;
