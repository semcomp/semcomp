function Step(
  { index, isActive, onClick, activeColor, unactiveColor }:
  {
    index: number,
    isActive: boolean,
    onClick: any,
    activeColor: string,
    unactiveColor: string
  }
) {
  return (
    <button className="relative py-3" style={{ outline: "none" }} onClick={onClick}>
      <p className={`flex items-center justify-center w-8 h-8 rounded-full ${isActive ? `bg-${activeColor} text-${unactiveColor}` : `shadow-md bg-white`}`}>{index + 1}</p>
    </button>
  );
}

export default Step;
