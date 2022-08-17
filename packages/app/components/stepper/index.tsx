import Step from "./step";

/**
 * This is a simple stepper without text
 * @param { Object } props
 * @param { number } props.numberOfSteps
 * @param { number } props.activeStep
 * @param { (clickedStep: number) => void } [props.onStepClick] Callback called
 * when the user clicks on a step ball
 */
const Stepper = ({ numberOfSteps, activeStep, onStepClick }) => {
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
    <div className="stepper-component-root">
      {/* This is the thin line that "connects" the steps */}
      <div className="straight-line" />

      {renderSteps()}
    </div>
  );
};

export default Stepper;
