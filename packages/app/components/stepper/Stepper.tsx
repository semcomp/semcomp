import Step from "./Step";

function Stepper(
  { numberOfSteps, activeStep, onStepClick, activeColor, unactiveColor}:
  {
    numberOfSteps: number,
    activeStep: number,
    onStepClick: Function,
    activeColor: string,
    unactiveColor: string
  }
) {
  function renderSteps() {
    if (!numberOfSteps) throw new Error("Stepper must have at least one step");
    const stepElements = [];
    for (let index = 0; index < numberOfSteps; index++) {
      stepElements.push(
        <Step
          index={index}
          isActive={index === activeStep}
          onClick={() => onStepClick && onStepClick(index)}
          key={index}
          activeColor={activeColor}
          unactiveColor={unactiveColor}
        />
      );
    }
    return stepElements;
  }

  return (
    <div className={"flex justify-between relative"}>
      {/* This is the thin line that "connects" the steps */}
      <div className={"w-full h-px top-1/2 absolute bg-white"}/>

      {renderSteps()}
    </div>
  );
};

export default Stepper;
