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
      <div 
        className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center`}
        style={{
          backgroundColor: isActive ? activeColor : 'white',
          color: isActive ? unactiveColor : '#242d5c'
        }}
      >
        <span className="text-sm font-semibold leading-none">{index + 1}</span>
      </div>
    </button>
  );
}

export default Step;
