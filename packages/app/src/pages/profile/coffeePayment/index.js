import React, { useState } from "react";
import Modal from "../../../components/modal";
import Stepper from "../../../components/stepper";
import CoffeeStep1 from "./step1";
import CoffeeStep2 from "./step2";
import CoffeeStep3 from "./step3";

function CoffeePayment({ onRequestClose }) {
  const [coffeeStep, setCoffeeStep] = useState(0);

  function handleStepClick(newStep) {
    setCoffeeStep(newStep);
  }

  const stepComponent = [<CoffeeStep1 />, <CoffeeStep2 />, <CoffeeStep3 />][
    coffeeStep
  ];

  return (
    <Modal onRequestClose={onRequestClose}>
      <div>
        <div className="card">
          <h1>Pagamento por PIX do Coffee da Semcomp Beta!</h1>
          <div className="stepper-container">
            <Stepper
              numberOfSteps={3}
              activeStep={coffeeStep}
              onStepClick={handleStepClick}
            />
          </div>
          {stepComponent}
        </div>
        <div className="buttons-container">
          {coffeeStep === 0 ? (
            <></>
          ) : (
            <button
              className=""
              type="button"
              onClick={() => setCoffeeStep(coffeeStep - 1)}
            >
              Voltar
            </button>
          )}
          <button className="cancel" type="button" onClick={onRequestClose}>
            Cancelar
          </button>
          <button
            className=""
            type="button"
            onClick={() => setCoffeeStep(coffeeStep + 1)}
          >
            Próximo
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CoffeePayment;
