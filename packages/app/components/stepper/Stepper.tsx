import Step from "./Step";

function Stepper(
  { numberOfSteps, activeStep, onStepClick, activeColor, unactiveColor, connectorColor }:
  {
    numberOfSteps: number,
    activeStep: number,
    onStepClick: Function,
    activeColor: string,
    unactiveColor: string,
    connectorColor?: string,
  }
) {
  function renderSteps() {
    console.log(connectorColor);
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
      <div
        className={`w-full h-px top-1/2 absolute`}
        style={{ backgroundColor: connectorColor || '#E8E8E8' }}
      />

      {renderSteps()}
    </div>
  );
};

export default Stepper;
