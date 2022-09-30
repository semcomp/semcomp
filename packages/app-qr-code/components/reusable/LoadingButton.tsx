import Button from '@mui/material/Button';

import Spinner from './Spinner';

/**
 * This is a normal button, but with an aditional prop `isLoading`, that when receives a
 * truthy value, will show a spinner beside the button text, and prevent the button
 * from being clicked.
 *
 * Any prop not described below will be forwarded to the `svg` element.
 *
 * @param {object} param
 * @return {object}
 */
function LoadingButton({
  children,
  isLoading,
  onClick = () => {},
  spinnerColor = 'white',
  ...props
}) {
  /**
   * @return {void}
   */
  function click() {
    // Cannot click the button when it's loading.
    if (isLoading) return;
    onClick();
  }

  return (
    <Button {...props} onClick={click}>
      {children}
      { isLoading &&
        <Spinner size='small' color={spinnerColor} strokeWidth={2} className='ml-2' />
      }
    </Button>
  );
}

export default LoadingButton;
