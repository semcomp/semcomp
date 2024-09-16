import Step from "./Step";

function Stepper(
  { numberOfSteps, activeStep, onStepClick }:
  {
    numberOfSteps: number,
    activeStep: number,
    onStepClick: Function,
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
        />
      );
    }
    return stepElements;
  }

  return (
    <div className="flex justify-between relative text-black">
      {/* This is the thin line that "connects" the steps */}
      <div className="w-full h-px top-1/2 absolute bg-black" />

      {renderSteps()}
    </div>
  );
};

export default Stepper;
