/**
 * This is a simple spinner used to indicate to the user that something is loading.
 *
 * Any prop not described below will be forwarded to the `svg` element.
 *
 * @param {object} param
 * @return {object}
 */
function Spinner({size = 'medium', strokeWidth = 4, color = 'black', ...props}) {
  const sizeInPixels = {
    'large': 40,
    'medium': 24,
    'small': 18,
    'extra-small': 12,
  }[size];

  if (!sizeInPixels) throw new Error(`Invalid size value '${size}'`);

  return <svg
    viewBox={`0 0 ${sizeInPixels} ${sizeInPixels}`}
    width={sizeInPixels}
    height={sizeInPixels}
    {...props}
  >
    <circle
      cx={sizeInPixels / 2}
      cy={sizeInPixels / 2}
      r={(sizeInPixels - strokeWidth) / 2}
      stroke={color}
      strokeLinecap='round'
      fill='transparent'
      className={size}
      strokeWidth={strokeWidth}
    />
  </svg>;
}

export default Spinner;
