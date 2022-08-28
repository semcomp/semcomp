function Step(
  { index, isActive, onClick }:
  {
    index: number,
    isActive: boolean,
    onClick: any,
  }
) {
  return (
    <button className="relative py-3" onClick={onClick}>
      <p className={`flex items-center justify-center w-8 h-8 shadow rounded-full bg-white ${isActive ? "bg-primary text-white" : ""}`}>{index + 1}</p>
    </button>
  );
}

export default Step;
