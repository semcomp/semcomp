import Spinner from "../spinner";

/**
 * A button that will display a cool spinner when the `isLoading` prop is true.
 * Useful for letting the user know when a request is currently being made.
 * Do note that, although not specified here, this component will forward any
 * unknown prop into it's root button component, and therefore supports any prop
 * a regular button does.
 *
 * @param { Object } props
 * @param { boolean } [props.isLoading] - If this props is true, a cool spinnner
 * will be rendered, and while this prop is true, no `onClick` events will be propagated.
 * @param { () => void } [props.onClick] - A function that will be called whenever
 * the button is clicked.
 */
function LoadingButton({
  children,
  isLoading,
  spinnerColor = "white",
  onClick = () => {},
  ...props
}) {
  function click() {
    // Don't propagate the click if button is already loading
    // This is to prevent impatient users from breaking the whole app
    if (isLoading) return;

    onClick();
  }

  return (
    <button
      {...props}
      onClick={click}
      className={`loading-button ${props.className ? props.className : ""}`}
    >
      {children}
      {isLoading && (
        <>
          {/* This span exists purely to give some space between the text and the spinner */}
          <span className="spacing" />

          <Spinner size="small" color={spinnerColor} strokeWidth={2} />
        </>
      )}
    </button>
  );
}

export default LoadingButton;
