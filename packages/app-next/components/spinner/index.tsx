function Spinner({
  size = "small",
  strokeWidth = 2,
  color = "black",
  ...props
}) {
  const sizeInPixels = {
    large: 40,
    medium: 24,
    small: 18,
    "extra-small": 12,
  }[size];

  if (!sizeInPixels) throw new Error(`Invalid size value '${size}'`);

  return (
    <svg
      viewBox={`0 0 ${sizeInPixels} ${sizeInPixels}`}
      width={sizeInPixels}
      height={sizeInPixels}
      className={(props.className ? props.className : "") + " spinner"}
      {...props}
    >
      <circle
        cx={sizeInPixels / 2}
        cy={sizeInPixels / 2}
        r={(sizeInPixels - strokeWidth) / 2}
        stroke={color}
        strokeLinecap="round"
        fill="transparent"
        className={size}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

export default Spinner;
