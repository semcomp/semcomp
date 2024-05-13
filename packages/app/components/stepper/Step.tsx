function Step(
  { index, isActive, onClick }:
  {
    index: number,
    isActive: boolean,
    onClick: any,
  }
) {
  return (
    <button className="relative py-3" style={{ outline: "none" }} onClick={onClick}>
      <p className={`flex items-center justify-center w-8 h-8 rounded-full ${isActive ? "bg-primary text-white" : "shadow-md bg-white"}`}>{index + 1}</p>
    </button>
  );
}

export default Step;
